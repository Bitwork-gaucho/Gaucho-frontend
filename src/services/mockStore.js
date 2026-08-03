const STORE_KEY = 'gaucho_store_v1'

const SEED = {
  batches: [
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
      pickupDate: null,
      pickupWindow: null,
      origin: {
        farm: 'Estancia La Cumbre',
        region: 'Córdoba',
        country: 'Argentina',
        coords: '34.6°S · 64.3°W',
      },
    },
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
      deliveryWeeks: 6,
      pickupDate: null,
      pickupWindow: null,
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
      deliveryWeeks: 6,
      pickupDate: null,
      pickupWindow: null,
      origin: {
        farm: 'Estancia Don Carlos',
        region: 'La Pampa',
        country: 'Argentina',
        coords: '37.1°S · 65.4°W',
      },
    },
    {
      id: 'batch-000',
      name: 'Batch 000 (pilot)',
      meatType: 'Ribeye, 250 g bøffer',
      description: 'Pilotbatch · afsluttet',
      status: 'COMPLETED',
      soldKilos: 500,
      targetKilos: 500,
      pricePerKg: 149,
      customerCount: 38,
      deliveryWeeks: 6,
      pickupDate: '2026-04-12',
      pickupWindow: '10:00–14:00',
      origin: {
        farm: 'Estancia La Cumbre',
        region: 'Córdoba',
        country: 'Argentina',
        coords: '34.6°S · 64.3°W',
      },
    },
  ],
  orders: [
    {
      id: 'ord-001',
      batchId: 'batch-001',
      userEmail: 'hans@example.com',
      kilos: 5,
      amount: 745,
      status: 'PAID',
      paidAt: '2026-05-02T10:15:00Z',
      receiptId: 'rcpt-001',
      barcodeData: 'GAUCHO-ord-001',
      delivered: false,
    },
    {
      id: 'ord-002',
      batchId: 'batch-001',
      userEmail: 'lise@example.com',
      kilos: 10,
      amount: 1490,
      status: 'PAID',
      paidAt: '2026-05-01T14:30:00Z',
      receiptId: 'rcpt-002',
      barcodeData: 'GAUCHO-ord-002',
      delivered: false,
    },
    {
      id: 'ord-003',
      batchId: 'batch-001',
      userEmail: 'mads@example.com',
      kilos: 2,
      amount: 298,
      status: 'PAID',
      paidAt: '2026-05-03T09:00:00Z',
      receiptId: 'rcpt-003',
      barcodeData: 'GAUCHO-ord-003',
      delivered: false,
    },
  ],
}

function read() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  const fresh = JSON.parse(JSON.stringify(SEED))
  write(fresh)
  return fresh
}

function write(data) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

const delay = (ms) => new Promise(r => setTimeout(r, ms))

export const mockStore = {
  async getAllBatches() {
    await delay(50)
    return read().batches
  },

  async getBatchById(id) {
    await delay(50)
    return read().batches.find(b => b.id === id) || null
  },

  async createBatch(data) {
    await delay(100)
    const store = read()
    const id = `batch-${Date.now()}`
    const batch = {
      id,
      name: data.name || `Batch ${store.batches.length + 1}`,
      meatType: data.meatType || '',
      description: data.description || '',
      status: data.status || 'UPCOMING',
      soldKilos: 0,
      targetKilos: Number(data.targetKilos) || 0,
      pricePerKg: Number(data.pricePerKg) || 0,
      comparePricePerKg: data.comparePricePerKg ? Number(data.comparePricePerKg) : null,
      compareRetailer: data.compareRetailer || '',
      customerCount: 0,
      savingsPercent: data.comparePricePerKg
        ? Math.round((1 - Number(data.pricePerKg) / Number(data.comparePricePerKg)) * 100)
        : null,
      deliveryWeeks: Number(data.deliveryWeeks) || 6,
      pickupDate: null,
      pickupWindow: null,
      origin: data.origin || null,
    }
    store.batches.push(batch)
    write(store)
    return batch
  },

  async updateBatch(id, patch) {
    await delay(100)
    const store = read()
    const idx = store.batches.findIndex(b => b.id === id)
    if (idx === -1) return null
    store.batches[idx] = { ...store.batches[idx], ...patch, id }
    write(store)
    return store.batches[idx]
  },

  async deleteBatch(id) {
    await delay(100)
    const store = read()
    store.batches = store.batches.filter(b => b.id !== id)
    store.orders = store.orders.filter(o => o.batchId !== id)
    write(store)
    return { success: true }
  },

  async getOrdersByBatch(batchId) {
    await delay(50)
    return read().orders.filter(o => o.batchId === batchId)
  },

  async getOrdersByUser(userEmail) {
    await delay(50)
    return read().orders.filter(o => o.userEmail === userEmail)
  },

  async getOrderByBatchAndUser(batchId, userEmail) {
    await delay(50)
    return read().orders.find(o => o.batchId === batchId && o.userEmail === userEmail) || null
  },

  async createOrder(batchId, userEmail, kilos) {
    await delay(100)
    const store = read()
    const batch = store.batches.find(b => b.id === batchId)
    if (!batch) return null
    const id = `ord-${Date.now()}`
    const amount = kilos * batch.pricePerKg
    const order = {
      id,
      batchId,
      userEmail,
      kilos,
      amount,
      status: 'PENDING',
      paidAt: null,
      receiptId: null,
      barcodeData: null,
      delivered: false,
    }
    store.orders.push(order)
    write(store)
    return order
  },

  async payOrder(orderId) {
    await delay(200)
    const store = read()
    const order = store.orders.find(o => o.id === orderId)
    if (!order) return null
    order.status = 'PAID'
    order.paidAt = new Date().toISOString()
    order.receiptId = `rcpt-${orderId}`
    order.barcodeData = `GAUCHO-${orderId}`
    // bump batch sold weight + customer count
    const batch = store.batches.find(b => b.id === order.batchId)
    if (batch) {
      batch.soldKilos += order.kilos
      batch.customerCount += 1
      const pct = Math.round((batch.soldKilos / batch.targetKilos) * 100)
      batch.nextMilestonePercent = pct >= 75 ? 100 : pct >= 50 ? 75 : 50
    }
    write(store)
    return order
  },

  async refundOrder(orderId) {
    await delay(150)
    const store = read()
    const order = store.orders.find(o => o.id === orderId)
    if (!order) return null
    if (order.status === 'REFUNDED') return order
    order.status = 'REFUNDED'
    const batch = store.batches.find(b => b.id === order.batchId)
    if (batch && order.status !== 'PENDING') {
      batch.soldKilos = Math.max(0, batch.soldKilos - order.kilos)
      batch.customerCount = Math.max(0, batch.customerCount - 1)
    }
    write(store)
    return order
  },

  async cancelOrder(orderId) {
    await delay(100)
    const store = read()
    const order = store.orders.find(o => o.id === orderId)
    if (!order) return null
    if (order.status === 'CANCELLED' || order.status === 'REFUNDED') return order
    const wasPaid = order.status === 'PAID'
    order.status = 'CANCELLED'
    const batch = store.batches.find(b => b.id === order.batchId)
    if (batch && wasPaid) {
      batch.soldKilos = Math.max(0, batch.soldKilos - order.kilos)
      batch.customerCount = Math.max(0, batch.customerCount - 1)
    }
    write(store)
    return order
  },

  async confirmDelivery(orderId) {
    await delay(100)
    const store = read()
    const order = store.orders.find(o => o.id === orderId)
    if (!order) return null
    order.delivered = true
    write(store)
    return order
  },

  async getAllOrders() {
    await delay(50)
    return read().orders
  },

  async resetStore() {
    write(JSON.parse(JSON.stringify(SEED)))
    return { success: true }
  },
}
