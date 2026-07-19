## ADDED Requirements

### Requirement: Physics engine interface
The system SHALL define an `IPhysicsEngine` interface that abstracts all physics operations behind a common contract.

#### Scenario: Interface provides all required methods
- **WHEN** a class implements `IPhysicsEngine`
- **THEN** it SHALL implement `createWorld`, `addBody`, `removeBody`, `getBody`, `setBodyVelocity`, `applyForce`, `step`, `onCollision`, `getBodies`, `getWorldState`

### Requirement: Matter.js implementation
The system SHALL provide a `MatterPhysicsEngine` class implementing `IPhysicsEngine` using Matter.js.

#### Scenario: Engine wraps Matter.js world
- **WHEN** `MatterPhysicsEngine` is instantiated with a `WorldConfig`
- **THEN** a Matter.js `Engine` and `World` SHALL be created with the specified dimensions

#### Scenario: Engine step advances simulation
- **WHEN** `step(delta)` is called
- **THEN** Matter.js SHALL advance by the specified delta

### Requirement: Fixed timestep
The engine SHALL operate on a fixed timestep of `1/60` second per step.

#### Scenario: Deterministic output
- **WHEN** the same sequence of `step()` calls and inputs is applied twice
- **THEN** the resulting world state SHALL be identical

### Requirement: Random seeding
All randomness used by the engine SHALL be externally seeded.

#### Scenario: Seeded random produces consistent results
- **WHEN** the same seed is provided to the engine
- **THEN** all random operations (spawn assignment, etc.) SHALL produce identical results

### Requirement: Wall behaviours
The system SHALL support 4 wall types: `bounce`, `reflect`, `absorb`, `amplify`.

#### Scenario: Bounce wall reflects at equal angle
- **WHEN** a vehicle collides with a `bounce` wall
- **THEN** the vehicle SHALL reflect at angle of incidence = angle of reflection with restitution ~0.7

#### Scenario: Reflect wall reverses velocity
- **WHEN** a vehicle collides with a `reflect` wall
- **THEN** the vehicle's velocity vector SHALL be reversed (mirror effect)

#### Scenario: Absorb wall stops perpendicular velocity
- **WHEN** a vehicle collides with an `absorb` wall
- **THEN** the vehicle's perpendicular velocity component SHALL be zeroed

#### Scenario: Amplify wall multiplies outgoing velocity
- **WHEN** a vehicle collides with an `amplify` wall
- **THEN** the vehicle's outgoing velocity SHALL be multiplied by 1.5

### Requirement: Vehicle control
The engine SHALL accept `VehicleCommand` objects to control vehicles.

#### Scenario: Throttle applies forward force
- **WHEN** a command with throttle > 0 is applied
- **THEN** a forward force SHALL be applied in the vehicle's heading direction

#### Scenario: No reverse movement
- **WHEN** throttle is 0
- **THEN** no forward force SHALL be applied; friction decelerates naturally

#### Scenario: Turn changes heading
- **WHEN** a command with turn ≠ 0 is applied
- **THEN** the vehicle SHALL rotate at a rate proportional to the turn value

### Requirement: Boost system
The engine SHALL support a boost mechanic with active and cooldown states.

#### Scenario: Boost activation
- **WHEN** a command with `boost: true` is applied while boost is ready
- **THEN** the vehicle SHALL enter ACTIVE state with speed multiplied by 2.5 and turn rate reduced to 50%

#### Scenario: Boost cooldown
- **WHEN** the boost duration timer expires
- **THEN** the vehicle SHALL enter RECHARGING state for the cooldown duration

#### Scenario: Boost ready indicator
- **WHEN** the cooldown timer expires
- **THEN** the vehicle SHALL return to IDLE state and be ready to boost again

### Requirement: Vehicle shapes
The system SHALL support 4 vehicle shapes: `circle`, `square`, `diamond`, `hexagon`.

#### Scenario: Shape affects collision normal
- **WHEN** two vehicles of different shapes collide
- **THEN** the collision normal and resulting rebound SHALL differ according to shape geometry

#### Scenario: Shape creation
- **WHEN** a body is created with a specific shape
- **THEN** the physics engine SHALL create the corresponding geometric body (circle, rectangle, or polygon)

### Requirement: Zone modifiers
The system SHALL apply floor zone modifiers to vehicles based on their position.

#### Scenario: Zone applies friction and speed modifiers
- **WHEN** a vehicle is inside a zone
- **THEN** the vehicle's friction, max speed, and turn rate SHALL be modified according to the zone type

#### Scenario: Multiple zones
- **WHEN** a vehicle overlaps multiple zones
- **THEN** the zone with the highest priority (last in list) SHALL apply

### Requirement: Collision events
The engine SHALL emit collision events that `GameState` can subscribe to.

#### Scenario: Vehicle-vehicle collision fires event
- **WHEN** two vehicles collide
- **THEN** a `CollisionEvent` SHALL be emitted with both body IDs, contact point, normal, and relative velocity
