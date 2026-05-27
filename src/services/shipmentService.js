const delay = (ms) => new Promise(r => setTimeout(r, ms))

const MOCK_SHIPMENT = {
  id: 'ship-001',
  batchId: 'batch-001',
  vessel: 'MV Gaucho Star',
  containerId: 'GAUC0010001',
  departedAt: '2026-05-10T08:00:00Z',
  etaAt: '2026-06-20T12:00:00Z',
  currentLat: 15.2,
  currentLng: -32.8,
  currentLocationName: 'Midtatlanten',
  status: 'IN_TRANSIT',
  temperatureLog: [
    { ts: '2026-05-10T12:00:00Z', celsius: -18.2 },
    { ts: '2026-05-15T12:00:00Z', celsius: -18.5 },
    { ts: '2026-05-20T12:00:00Z', celsius: -18.1 },
    { ts: '2026-05-25T12:00:00Z', celsius: -18.4 },
  ],
}

export const shipmentService = {
  async getShipmentLocation(shipmentId) {
    await delay(400)
    return {
      lat: MOCK_SHIPMENT.currentLat,
      lng: MOCK_SHIPMENT.currentLng,
      name: MOCK_SHIPMENT.currentLocationName,
    }
  },

  async getShipmentETA(shipmentId) {
    await delay(300)
    return MOCK_SHIPMENT.etaAt
  },

  async getShipmentStatus(shipmentId) {
    await delay(200)
    return MOCK_SHIPMENT.status
  },

  async getTemperatureLog(shipmentId) {
    await delay(400)
    return MOCK_SHIPMENT.temperatureLog
  },

  async setTemperatureThresholds(min, max) {
    await delay(300)
    console.log(`[mock] temperature thresholds set: ${min}°C – ${max}°C`)
    return { success: true }
  },
}
