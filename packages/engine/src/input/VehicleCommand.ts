import type { BodyId } from '../physics/types.js'

export interface VehicleCommand {
  vehicleId: BodyId
  throttle: number
  turn: number
  boost: boolean
}
