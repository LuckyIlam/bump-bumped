const VEHICLE_ID_PREFIX = 'vehicle'

export function vehicleId(index: number): string {
  return `${VEHICLE_ID_PREFIX}_${index}`
}

export function vehicleIndex(id: string): number {
  return parseInt(id.replace(`${VEHICLE_ID_PREFIX}_`, ''), 10)
}
