import { mockStore } from './mockStore.js'

export const batchService = {
  async getActiveBatches() {
    const all = await mockStore.getAllBatches()
    return all.filter(b => b.status === 'WAITING_TO_FILL')
  },

  async getUpcomingBatches() {
    const all = await mockStore.getAllBatches()
    return all.filter(b => b.status === 'UPCOMING')
  },

  async getCompletedBatches() {
    const all = await mockStore.getAllBatches()
    return all.filter(b => b.status === 'COMPLETED')
  },

  async getBatchById(batchId) {
    return mockStore.getBatchById(batchId)
  },

  async getOrderByBatchAndUser(batchId, userEmail) {
    return mockStore.getOrderByBatchAndUser(batchId, userEmail)
  },

  async registerInterest(batchId, email) {
    console.log(`[mock] interest registered: batch=${batchId} email=${email}`)
    return { success: true }
  },

  async joinWaitingList(batchId, userId) {
    return { success: true }
  },

  async createOrder(batchId, userEmail, kilos) {
    return mockStore.createOrder(batchId, userEmail, kilos)
  },

  async cancelOrder(orderId) {
    return mockStore.cancelOrder(orderId)
  },

  async createBatch(batchData) {
    return mockStore.createBatch(batchData)
  },

  async updateBatch(batchId, batchData) {
    return mockStore.updateBatch(batchId, batchData)
  },

  async deleteBatch(batchId) {
    return mockStore.deleteBatch(batchId)
  },

  async setBatchStatus(batchId, status) {
    return mockStore.updateBatch(batchId, { status })
  },

  async setPickupWindow(batchId, date, timeWindow) {
    return mockStore.updateBatch(batchId, { pickupDate: date, pickupWindow: timeWindow })
  },

  async getPaymentOverview(batchId) {
    const batch = await mockStore.getBatchById(batchId)
    const orders = await mockStore.getOrdersByBatch(batchId)
    const paid = orders.filter(o => o.status === 'PAID')
    return {
      batchId,
      totalCollected: paid.reduce((sum, o) => sum + o.amount, 0),
      targetAmount: batch ? batch.targetKilos * batch.pricePerKg : 0,
      customers: paid.map(o => ({
        orderId: o.id,
        email: o.userEmail,
        kilos: o.kilos,
        paid: o.amount,
        status: o.status,
        delivered: o.delivered,
        barcodeData: o.barcodeData,
      })),
    }
  },
}
