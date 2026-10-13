import test from 'node:test'
import assert from 'node:assert/strict'
import { axiosInstance } from './axiosCalls/axios.js'
import {
  addToCartApi,
  calculateCartCount,
  calculateSubtotal,
  getCartApi,
  getCartState,
  removeFromCartApi,
  updateCartQuantityApi,
} from './services/cartApi.js'

test('calculateSubtotal sums (price * quantity) correctly', () => {
  const items = [
    { product: { price: 2999 }, quantity: 2 },
    { product: { price: 1499 }, quantity: 1 },
  ]
  assert.equal(calculateSubtotal(items), 7497)
  assert.equal(calculateSubtotal([]), 0)
})

test('calculateCartCount sums quantities across items', () => {
  const items = [
    { product: { price: 2999 }, quantity: 2 },
    { product: { price: 1499 }, quantity: 1 },
  ]
  assert.equal(calculateCartCount(items), 3)
  assert.equal(calculateCartCount([]), 0)
})

test('getCartState returns loading, error, empty, and ready states', () => {
  assert.equal(getCartState({ isLoading: true, error: '', cartItems: [] }), 'loading')
  assert.equal(getCartState({ isLoading: false, error: 'fail', cartItems: [] }), 'error')
  assert.equal(getCartState({ isLoading: false, error: '', cartItems: [] }), 'empty')
  assert.equal(getCartState({ isLoading: false, error: '', cartItems: [{}] }), 'ready')
})

test('getCartApi requests GET /cart and returns cart items', async () => {
  const originalGet = axiosInstance.get
  const cart = [{ product: { _id: '1', name: 'Keyboard' }, quantity: 2 }]
  let request
  axiosInstance.get = async (...args) => {
    request = args
    return { data: { cart } }
  }

  try {
    const result = await getCartApi()
    assert.deepEqual(result, cart)
    assert.deepEqual(request, ['/cart'])
  } finally {
    axiosInstance.get = originalGet
  }
})

test('addToCartApi requests POST /cart/:productId and returns updated cart', async () => {
  const originalPost = axiosInstance.post
  const cart = [{ product: { _id: 'prod-1' }, quantity: 1 }]
  let request
  axiosInstance.post = async (...args) => {
    request = args
    return { data: { cart } }
  }

  try {
    const result = await addToCartApi('prod-1')
    assert.deepEqual(result, cart)
    assert.deepEqual(request, ['/cart/prod-1'])
  } finally {
    axiosInstance.post = originalPost
  }
})

test('updateCartQuantityApi requests PATCH /cart/:productId and returns updated cart', async () => {
  const originalPatch = axiosInstance.patch
  const cart = [{ product: { _id: 'prod-1' }, quantity: 3 }]
  let request
  axiosInstance.patch = async (...args) => {
    request = args
    return { data: { cart } }
  }

  try {
    const result = await updateCartQuantityApi('prod-1', 3)
    assert.deepEqual(result, cart)
    assert.deepEqual(request, ['/cart/prod-1', { quantity: 3 }])
  } finally {
    axiosInstance.patch = originalPatch
  }
})

test('removeFromCartApi requests DELETE /cart/:productId and returns updated cart', async () => {
  const originalDelete = axiosInstance.delete
  const cart = []
  let request
  axiosInstance.delete = async (...args) => {
    request = args
    return { data: { cart } }
  }

  try {
    const result = await removeFromCartApi('prod-1')
    assert.deepEqual(result, cart)
    assert.deepEqual(request, ['/cart/prod-1'])
  } finally {
    axiosInstance.delete = originalDelete
  }
})
