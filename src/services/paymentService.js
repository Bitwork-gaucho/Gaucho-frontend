import { mockStore } from './mockStore.js'

export const paymentService = {
  async processPayment(orderId) {
    const order = await mockStore.payOrder(orderId)
    if (!order) return { success: false, error: 'Ordre ikke fundet' }
    return {
      success: true,
      receiptId: order.receiptId,
      barcodeData: order.barcodeData,
      orderId: order.id,
    }
  },

  async issueRefund(orderId) {
    const order = await mockStore.refundOrder(orderId)
    if (!order) return { success: false, error: 'Ordre ikke fundet' }
    return { success: true, orderId: order.id, status: order.status }
  },

  async bulkRefund(orderIds) {
    let refunded = 0
    for (const id of orderIds) {
      const order = await mockStore.refundOrder(id)
      if (order) refunded++
    }
    return { success: true, refunded }
  },

  async getReceipt(orderId) {
    const orders = await mockStore.getAllOrders()
    const order = orders.find(o => o.id === orderId)
    if (!order) return null
    return {
      orderId: order.id,
      receiptId: order.receiptId,
      barcodeData: order.barcodeData,
      issuedAt: order.paidAt,
      amount: order.amount,
      kilos: order.kilos,
      status: order.status,
    }
  },

  async confirmDelivery(orderId) {
    const order = await mockStore.confirmDelivery(orderId)
    if (!order) return { success: false, error: 'Ordre ikke fundet' }
    return { success: true, orderId: order.id, delivered: order.delivered }
  },
}
