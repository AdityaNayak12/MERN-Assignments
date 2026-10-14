import test from 'node:test'
import assert from 'node:assert/strict'
import { axiosInstance } from './axiosCalls/axios.js'
import {
  validateShippingForm,
  createPaymentOrderApi,
  verifyPaymentApi,
  getMyOrdersApi,
  getOrderByIdApi,
  updateOrderStatusApi,
} from './services/orderApi.js'

const validAddress = {
  fullName: 'Aarav Sharma',
  phone: '9876543210',
  addressLine1: '22 MG Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560001',
}

test('validateShippingForm accepts complete valid address', () => {
  const result = validateShippingForm(validAddress)
  assert.equal(result.isValid, true)
  assert.deepEqual(result.errors, {})
})

test('validateShippingForm rejects missing or whitespace-only fields', () => {
  const invalid = {
    ...validAddress,
    fullName: '   ',
    city: '',
  }
  const result = validateShippingForm(invalid)
  assert.equal(result.isValid, false)
  assert.ok(result.errors.fullName)
  assert.ok(result.errors.city)
})

test('validateShippingForm rejects invalid phone formats (not 10 digits)', () => {
  const badPhone = {
    ...validAddress,
    phone: '12345',
  }
  const result = validateShippingForm(badPhone)
  assert.equal(result.isValid, false)
  assert.equal(result.errors.phone, 'Phone number must be a valid 10-digit number')
})

test('validateShippingForm rejects invalid pincode format (not 6 digits)', () => {
  const badPincode = {
    ...validAddress,
    pincode: '5600',
  }
  const result = validateShippingForm(badPincode)
  assert.equal(result.isValid, false)
  assert.equal(result.errors.pincode, 'Pincode must contain 6 digits')
})

test('createPaymentOrderApi calls POST /orders/create-payment-order', async () => {
  const originalPost = axiosInstance.post
  let calledUrl = ''
  let payload = null

  axiosInstance.post = async (url, data) => {
    calledUrl = url
    payload = data
    return {
      data: {
        success: true,
        shopKartOrderId: '67abc123',
        razorpayOrderId: 'order_123',
        amount: 749700,
      },
    }
  }

  try {
    const result = await createPaymentOrderApi(validAddress)
    assert.equal(calledUrl, '/orders/create-payment-order')
    assert.deepEqual(payload, { shippingAddress: validAddress })
    assert.equal(result.shopKartOrderId, '67abc123')
  } finally {
    axiosInstance.post = originalPost
  }
})

test('verifyPaymentApi calls POST /orders/verify-payment', async () => {
  const originalPost = axiosInstance.post
  let calledUrl = ''
  let payload = null

  const paymentData = {
    shopKartOrderId: '67abc123',
    razorpay_order_id: 'order_123',
    razorpay_payment_id: 'pay_456',
    razorpay_signature: 'signature_sig',
  }

  axiosInstance.post = async (url, data) => {
    calledUrl = url
    payload = data
    return {
      data: {
        success: true,
        order: { _id: '67abc123', status: 'PLACED', paymentStatus: 'PAID' },
      },
    }
  }

  try {
    const result = await verifyPaymentApi(paymentData)
    assert.equal(calledUrl, '/orders/verify-payment')
    assert.deepEqual(payload, paymentData)
    assert.equal(result.order.status, 'PLACED')
    assert.equal(result.order.paymentStatus, 'PAID')
  } finally {
    axiosInstance.post = originalPost
  }
})

test('getMyOrdersApi calls GET /orders and returns orders list', async () => {
  const originalGet = axiosInstance.get
  let calledUrl = ''

  const mockOrders = [{ _id: 'ord1', totalAmount: 5000, status: 'PLACED' }]

  axiosInstance.get = async (url) => {
    calledUrl = url
    return { data: { success: true, orders: mockOrders } }
  }

  try {
    const orders = await getMyOrdersApi()
    assert.equal(calledUrl, '/orders')
    assert.deepEqual(orders, mockOrders)
  } finally {
    axiosInstance.get = originalGet
  }
})

test('getOrderByIdApi calls GET /orders/:id and returns order', async () => {
  const originalGet = axiosInstance.get
  let calledUrl = ''

  const mockOrder = { _id: 'ord123', totalAmount: 2999, status: 'PLACED' }

  axiosInstance.get = async (url) => {
    calledUrl = url
    return { data: { success: true, order: mockOrder } }
  }

  try {
    const order = await getOrderByIdApi('ord123')
    assert.equal(calledUrl, '/orders/ord123')
    assert.deepEqual(order, mockOrder)
  } finally {
    axiosInstance.get = originalGet
  }
})

test('updateOrderStatusApi calls PATCH /orders/:id/status and returns updated order', async () => {
  const originalPatch = axiosInstance.patch
  let calledUrl = ''
  let payload = null

  const updatedOrder = { _id: 'ord123', status: 'SHIPPED' }

  axiosInstance.patch = async (url, data) => {
    calledUrl = url
    payload = data
    return { data: { success: true, order: updatedOrder } }
  }

  try {
    const order = await updateOrderStatusApi('ord123', 'SHIPPED')
    assert.equal(calledUrl, '/orders/ord123/status')
    assert.deepEqual(payload, { status: 'SHIPPED' })
    assert.equal(order.status, 'SHIPPED')
  } finally {
    axiosInstance.patch = originalPatch
  }
})
