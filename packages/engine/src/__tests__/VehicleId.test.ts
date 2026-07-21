import { describe, expect, it } from 'vitest'
import { vehicleId, vehicleIndex } from '../state/VehicleId.js'

describe('vehicleId', () => {
  it('should produce vehicle_0 for index 0', () => {
    expect(vehicleId(0)).toBe('vehicle_0')
  })

  it('should produce vehicle_1 for index 1', () => {
    expect(vehicleId(1)).toBe('vehicle_1')
  })

  it('should produce vehicle_42 for index 42', () => {
    expect(vehicleId(42)).toBe('vehicle_42')
  })
})

describe('vehicleIndex', () => {
  it('should extract 0 from vehicle_0', () => {
    expect(vehicleIndex('vehicle_0')).toBe(0)
  })

  it('should extract 3 from vehicle_3', () => {
    expect(vehicleIndex('vehicle_3')).toBe(3)
  })

  it('should extract 42 from vehicle_42', () => {
    expect(vehicleIndex('vehicle_42')).toBe(42)
  })
})

describe('vehicleId / vehicleIndex roundtrip', () => {
  it('should be the identity function for index', () => {
    for (let i = 0; i < 8; i++) {
      expect(vehicleIndex(vehicleId(i))).toBe(i)
    }
  })
})
