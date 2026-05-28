const delay = (ms) => new Promise(r => setTimeout(r, ms))

const MOCK_IN_TRANSIT = [
  {
    id: 'batch-transit',
    name: 'Batch Transit',
    meatType: 'Ribeye, 250 g bøffer',
    description: 'Estancia La Cumbre · Córdoba · græsfodret, mørnet 21 dage — på vej til Danmark',
    status: 'IN_TRANSIT',
    soldKilos: 500,
    targetKilos: 500,
    pricePerKg: 149,
    comparePricePerKg: 289,
    compareRetailer: 'Føtex',
    customerCount: 38,
    savingsPercent: 48,
    deliveryWeeks: 2,
    shipmentId: 'ship-transit-001',
    origin: {
      farm: 'Estancia La Cumbre',
      region: 'Córdoba',
      country: 'Argentina',
      coords: '34.6°S · 64.3°W',
    },
  },
]

const MOCK_ACTIVE = [
  {
    id: 'batch-001',
    name: 'Batch 001',
    meatType: 'Ribeye, 250 g bøffer',
    description: 'Estancia La Cumbre · Córdoba · græsfodret, mørnet 21 dage',
    status: 'WAITING_TO_FILL',
    soldKilos: 312,
    targetKilos: 500,
    pricePerKg: 149,
    comparePricePerKg: 289,
    compareRetailer: 'Føtex',
    customerCount: 23,
    nextMilestonePercent: 75,
    savingsPercent: 48,
    deliveryWeeks: 6,
    origin: {
      farm: 'Estancia La Cumbre',
      region: 'Córdoba',
      country: 'Argentina',
      coords: '34.6°S · 64.3°W',
    },
  },
]

const MOCK_UPCOMING = [
  {
    id: 'batch-002',
    name: 'Batch 002',
    meatType: 'Entrecôte, 300 g bøffer',
    description: 'Estancia El Potrero · Buenos Aires · 28 dages tørmodning',
    status: 'UPCOMING',
    soldKilos: 0,
    targetKilos: 400,
    pricePerKg: 159,
    comparePricePerKg: 319,
    compareRetailer: 'Slagter',
    customerCount: 0,
    origin: {
      farm: 'Estancia El Potrero',
      region: 'Buenos Aires',
      country: 'Argentina',
      coords: '34.6°S · 58.4°W',
    },
  },
  {
    id: 'batch-003',
    name: 'Batch 003',
    meatType: 'Brisket, hele stykker',
    description: 'Estancia Don Carlos · La Pampa · langtidsmørnet til BBQ',
    status: 'UPCOMING',
    soldKilos: 0,
    targetKilos: 600,
    pricePerKg: 129,
    comparePricePerKg: 249,
    compareRetailer: 'Slagter',
    customerCount: 0,
    origin: {
      farm: 'Estancia Don Carlos',
      region: 'La Pampa',
      country: 'Argentina',
      coords: '37.1°S · 65.4°W',
    },
  },
]

const MOCK_COMPLETED = [
  {
    id: 'batch-000',
    name: 'Batch 000 (pilot)',
    meatType: 'Ribeye, 250 g bøffer',
    status: 'COMPLETED',
    soldKilos: 500,
    targetKilos: 500,
    customerCount: 38,
  },
]

export const batchService = {
  async getActiveBatches() {
    await delay(400)
    return [...MOCK_ACTIVE, ...MOCK_IN_TRANSIT]
  },

  async getUpcomingBatches() {
    await delay(300)
    return MOCK_UPCOMING
  },

  async getCompletedBatches() {
    await delay(300)
    return MOCK_COMPLETED
  },

  async getBatchById(batchId) {
    await delay(350)
    return [...MOCK_IN_TRANSIT, ...MOCK_ACTIVE, ...MOCK_UPCOMING, ...MOCK_COMPLETED]
      .find(b => b.id === batchId) || null
  },

  async getOrderByBatchAndUser(batchId, userId) {
    await delay(300)
    return null
  },

  async registerInterest(batchId, email) {
    await delay(600)
    console.log(`[mock] interest registered: batch=${batchId} email=${email}`)
    return { success: true }
  },

  async joinWaitingList(batchId, userId) {
    await delay(500)
    return { success: true }
  },

  async createOrder(batchId, userId, kilos) {
    await delay(800)
    return {
      success: true,
      orderId: `ord-${Date.now()}`,
      batchId,
      userId,
      kilos,
    }
  },

  async cancelOrder(orderId) {
    await delay(600)
    return { success: true }
  },

  async createBatch(batchData) {
    await delay(700)
    return { success: true, id: `batch-${Date.now()}`, ...batchData }
  },

  async updateBatch(batchId, batchData) {
    await delay(500)
    return { success: true }
  },

  async deleteBatch(batchId) {
    await delay(400)
    return { success: true }
  },

  async setBatchStatus(batchId, status) {
    await delay(400)
    return { success: true }
  },

  async setPickupWindow(batchId, date, timeWindow) {
    await delay(400)
    return { success: true }
  },

  async getPaymentOverview(batchId) {
    await delay(500)
    return {
      batchId,
      totalCollected: 312 * 149,
      targetAmount: 500 * 149,
      customers: [
        { email: 'hans@example.com', kilos: 5, paid: 745 },
        { email: 'lise@example.com', kilos: 10, paid: 1490 },
        { email: 'mads@example.com', kilos: 2, paid: 298 },
      ],
    }
  },
}
