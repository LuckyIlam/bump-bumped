const VEHICLE_ID_PREFIX = 'vehicle'

/** Converts a numeric index to a vehicle ID string (e.g. 0 → 'vehicle_0'). */
export function vehicleId(index: number): string {
  return `${VEHICLE_ID_PREFIX}_${index}`
}

/** Extracts the numeric index from a vehicle ID string (e.g. 'vehicle_3' → 3). */
export function vehicleIndex(id: string): number {
  return parseInt(id.replace(`${VEHICLE_ID_PREFIX}_`, ''), 10)
}
