import Matter from 'matter-js'
import type { CollisionCallback, IPhysicsEngine } from './IPhysicsEngine.js'
import type { BodyConfig, BodyId, BodyState, CollisionEvent, WallType, WorldConfig, WorldState } from './types.js'

const SHAPE_VERTICES: Record<string, (r: number) => { x: number; y: number }[]> = {
  hexagon: (r: number) => {
    const verts: { x: number; y: number }[] = []
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2
      verts.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r })
    }
    return verts
  },
  diamond: (r: number) => {
    return [
      { x: 0, y: -r },
      { x: r, y: 0 },
      { x: 0, y: r },
      { x: -r, y: 0 },
    ]
  },
}

interface PendingEffect {
  body: Matter.Body
  wallType: WallType
  normal: Matter.Vector
  depth: number
  preVelocity: { x: number; y: number }
}

export class MatterPhysicsEngine implements IPhysicsEngine {
  private engine!: Matter.Engine
  private world!: Matter.World
  private bodies: Map<BodyId, Matter.Body> = new Map()
  private wallBodies: Map<number, WallType> = new Map()
  private collisionCallback: CollisionCallback | null = null
  private pendingEffects: PendingEffect[] = []

  createWorld(config: WorldConfig): void {
    this.engine = Matter.Engine.create({ gravity: { x: 0, y: 0, scale: 0.001 } })
    this.world = this.engine.world

    for (const wall of config.walls) {
      const cx = (wall.x1 + wall.x2) / 2
      const cy = (wall.y1 + wall.y2) / 2
      const dx = wall.x2 - wall.x1
      const dy = wall.y2 - wall.y1
      const length = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx)

      const restitution = 0

      const body = Matter.Bodies.rectangle(cx, cy, length, 20, {
        isStatic: true,
        angle,
        restitution,
        friction: 0,
      })
      this.wallBodies.set(body.id, wall.type)
      Matter.Composite.add(this.world, body)
    }

    Matter.Events.on(this.engine, 'collisionStart', (event: any) => {
      for (const pair of event.pairs) {
        this.queueCollisionEffect(pair)
      }
      if (this.collisionCallback && event.pairs.length > 0) {
        this.collisionCallback({} as CollisionEvent)
      }
    })

    Matter.Events.on(this.engine, 'afterUpdate', () => {
      for (const effect of this.pendingEffects) {
        this.applyWallEffect(effect)
      }
      this.pendingEffects.length = 0
    })
  }

  private queueCollisionEffect(pair: any): void {
    const a = pair.bodyA
    const b = pair.bodyB
    const normal = pair.collision.normal
    const depth = pair.collision.depth ?? 1

    const wallTypeA = this.wallBodies.get(a.id)
    const wallTypeB = this.wallBodies.get(b.id)

    if (wallTypeA && !wallTypeB) {
      this.pendingEffects.push({ body: b, wallType: wallTypeA, normal, depth, preVelocity: { x: b.velocity.x, y: b.velocity.y } })
    } else if (wallTypeB && !wallTypeA) {
      this.pendingEffects.push({
        body: a,
        wallType: wallTypeB,
        normal: { x: -normal.x, y: -normal.y },
        depth,
        preVelocity: { x: a.velocity.x, y: a.velocity.y },
      })
    }
  }

  private applyWallEffect(effect: PendingEffect): void {
    const { body, wallType, normal, depth, preVelocity } = effect
    const vx = preVelocity.x
    const vy = preVelocity.y
    const speed = Math.sqrt(vx * vx + vy * vy)
    if (speed < 0.01) return

    const dot = vx * normal.x + vy * normal.y

    if (wallType === 'bounce') {
      const restitution = 0.7
      Matter.Body.setVelocity(body, {
        x: vx - (1 + restitution) * dot * normal.x,
        y: vy - (1 + restitution) * dot * normal.y,
      })
    } else if (wallType === 'reflect') {
      Matter.Body.setVelocity(body, {
        x: vx - 2 * dot * normal.x,
        y: vy - 2 * dot * normal.y,
      })
    } else if (wallType === 'absorb') {
      Matter.Body.setVelocity(body, {
        x: vx - dot * normal.x,
        y: vy - dot * normal.y,
      })
    } else if (wallType === 'amplify') {
      const refX = vx - 2 * dot * normal.x
      const refY = vy - 2 * dot * normal.y
      Matter.Body.setVelocity(body, { x: refX * 1.5, y: refY * 1.5 })
    }

    Matter.Body.setPosition(body, {
      x: body.position.x + normal.x * (depth + 2),
      y: body.position.y + normal.y * (depth + 2),
    })
  }

  setGravity(gravity: { x: number; y: number }): void {
    this.engine.gravity.x = gravity.x
    this.engine.gravity.y = gravity.y
  }

  addBody(config: BodyConfig): BodyId {
    let body: Matter.Body

    const bodyOpts: any = {
      label: config.id,
      restitution: config.restitution,
      friction: config.friction,
      frictionAir: 0.02,
      density: config.mass,
    }

    switch (config.shape) {
      case 'circle':
        body = Matter.Bodies.circle(config.x, config.y, config.radius ?? 20, bodyOpts)
        break
      case 'square': {
        const s = (config.radius ?? 20) * 2
        body = Matter.Bodies.rectangle(config.x, config.y, s, s, bodyOpts)
        break
      }
      case 'diamond':
      case 'hexagon': {
        const r = config.radius ?? 20
        const verts = SHAPE_VERTICES[config.shape](r) as any
        body = Matter.Bodies.fromVertices(config.x, config.y, verts, bodyOpts)
        break
      }
      default:
        body = Matter.Bodies.circle(config.x, config.y, 20, bodyOpts)
    }

    Matter.Body.setAngle(body, config.angle)
    Matter.Composite.add(this.world, body)
    this.bodies.set(config.id, body)

    return config.id
  }

  removeBody(id: BodyId): void {
    const body = this.bodies.get(id)
    if (body) {
      Matter.Composite.remove(this.world, body)
      this.bodies.delete(id)
    }
  }

  getBody(id: BodyId): BodyState | undefined {
    const body = this.bodies.get(id)
    if (!body) return undefined
    return this.toBodyState(id, body)
  }

  setBodyVelocity(id: BodyId, velocity: { x: number; y: number }): void {
    const body = this.bodies.get(id)
    if (body) {
      Matter.Body.setVelocity(body, velocity)
    }
  }

  setAngularVelocity(id: BodyId, velocity: number): void {
    const body = this.bodies.get(id)
    if (body) {
      Matter.Body.setAngularVelocity(body, velocity)
    }
  }

  setFrictionAir(id: BodyId, friction: number): void {
    const body = this.bodies.get(id)
    if (body) {
      body.frictionAir = friction
    }
  }

  applyForce(id: BodyId, force: { x: number; y: number }): void {
    const body = this.bodies.get(id)
    if (body) {
      Matter.Body.applyForce(body, body.position, force)
    }
  }

  step(delta: number): void {
    Matter.Engine.update(this.engine, delta * 1000)
  }

  onCollision(callback: CollisionCallback): void {
    this.collisionCallback = callback
  }

  getBodies(): BodyState[] {
    const result: BodyState[] = []
    for (const [id, body] of this.bodies) {
      result.push(this.toBodyState(id, body))
    }
    return result
  }

  getWorldState(): WorldState {
    return {
      bodies: this.getBodies(),
      time: this.engine.timing.timestamp,
    }
  }

  private toBodyState(id: BodyId, body: Matter.Body): BodyState {
    return {
      id,
      x: body.position.x,
      y: body.position.y,
      angle: body.angle,
      velocityX: body.velocity.x,
      velocityY: body.velocity.y,
      angularVelocity: body.angularVelocity,
    }
  }
}
