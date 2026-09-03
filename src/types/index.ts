export interface Batch {
  id: string
  name: string
  meatType: string
  description: string
  status: 'UPCOMING' | 'WAITING_TO_FILL' | 'ORDERED' | 'IN_TRANSIT' | 'AT_CUSTOMS' | 'READY_FOR_PICKUP' | 'COMPLETED'
  pricePerKg: number
  targetKilos: number
  soldKilos: number
  customerCount: number
  origin?: {
    farm: string
    region: string
    country: string
    coords: string
  }
  comparePricePerKg?: number
  compareRetailer?: string
  savingsPercent?: number
  shipmentId?: string
  pickupDate?: string
  pickupLocation?: string
  pickupTimeWindow?: {
    start: string
    end: string
  }
  minPurchaseKg?: number
  maxPurchaseKg?: number
}

export interface Order {
  id: string
  batchId: string
  userEmail: string
  kilos: number
  amount: number
  status: 'PENDING' | 'PAID' | 'CANCELLED'
  receiptId?: string
  createdAt: string
  deliveryConfirmedAt?: string
  pickupTime?: string
}

export interface Receipt {
  receiptId: string
  orderId: string
  kilos: number
  amount: number
  barcodeData: string
}

export interface Session {
  email: string
  role: 'user' | 'admin'
}

export interface User {
  id: string
  email: string
  role: 'user' | 'admin'
  createdAt: string
}

export interface Shipment {
  id: string
  batchId: string
  status: 'PREPARING' | 'IN_TRANSIT' | 'AT_CUSTOMS' | 'CLEARED'
  location?: {
    lat: number
    long: number
  }
  eta?: string
  supplierName?: string
  logisticsCompany?: string
  containerNumber?: string
  pricePerKg?: number
  temperatureMin?: number
  temperatureMax?: number
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  email: string
  batchId: string
  type: 'MILESTONE_50' | 'MILESTONE_75' | 'ORDERED' | 'IN_TRANSIT' | 'AT_CUSTOMS' | 'READY_FOR_PICKUP' | 'WAITING_LIST_AVAILABLE'
  status: 'UNREAD' | 'READ'
  message: string
  createdAt: string
}

export interface WaitingListEntry {
  id: string
  batchId: string
  email: string
  position: number
  addedAt: string
  notifiedAt?: string
}
