import test from 'node:test'
import assert from 'node:assert/strict'
import { axiosInstance } from './axiosCalls/axios.js'
import {
  buildProductParams,
  getProduct,
  getProducts,
  getProductsState,
  getStockLabel,
  PRODUCT_CATEGORIES,
} from './services/productApi.js'

test('product filters expose the required category options', () => {
  assert.deepEqual(PRODUCT_CATEGORIES, ['Electronics', 'Fashion', 'Books', 'Home'])
})

test('buildProductParams keeps only non-empty search and category values', () => {
  assert.deepEqual(
    buildProductParams({ search: '  keyboard ', category: '   ' }),
    { search: 'keyboard' },
  )
})

test('getProducts returns products and forwards query params', async () => {
  const originalGet = axiosInstance.get
  const products = [{ _id: '1', name: 'Keyboard' }]
  let request
  axiosInstance.get = async (...args) => {
    request = args
    return { data: { products } }
  }

  try {
    assert.deepEqual(await getProducts({ search: 'keyboard', category: 'Accessories' }), products)
    assert.deepEqual(request, ['/products', { params: { search: 'keyboard', category: 'Accessories' } }])
  } finally {
    axiosInstance.get = originalGet
  }
})

test('getProduct returns the API product object', async () => {
  const originalGet = axiosInstance.get
  const product = { _id: '1', name: 'Keyboard' }
  let request
  axiosInstance.get = async (...args) => {
    request = args
    return { data: { product } }
  }

  try {
    assert.deepEqual(await getProduct('1'), product)
    assert.deepEqual(request, ['/products/1'])
  } finally {
    axiosInstance.get = originalGet
  }
})

test('product rendering helpers expose loading, error, empty, and ready states', () => {
  assert.equal(getProductsState({ isLoading: true, error: '', products: [] }), 'loading')
  assert.equal(getProductsState({ isLoading: false, error: 'failed', products: [] }), 'error')
  assert.equal(getProductsState({ isLoading: false, error: '', products: [] }), 'empty')
  assert.equal(getProductsState({ isLoading: false, error: '', products: [{}] }), 'ready')
})

test('stock labels distinguish available and unavailable products', () => {
  assert.equal(getStockLabel(4), '4 in stock')
  assert.equal(getStockLabel(0), 'Out of stock')
})
