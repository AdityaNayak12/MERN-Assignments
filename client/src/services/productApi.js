import { axiosInstance } from '../axiosCalls/axios.js'

export const PRODUCT_CATEGORIES = ['Electronics', 'Fashion', 'Books', 'Home']

export function buildProductParams(params = {}) {
  return Object.fromEntries(
    ['search', 'category']
      .map((key) => [key, typeof params[key] === 'string' ? params[key].trim() : ''])
      .filter(([, value]) => value),
  )
}

export async function getProducts(params) {
  const queryParams = buildProductParams(params)
  const response = Object.keys(queryParams).length
    ? await axiosInstance.get('/products', { params: queryParams })
    : await axiosInstance.get('/products')

  return response.data.products
}

export async function getProduct(id) {
  const response = await axiosInstance.get(`/products/${id}`)
  return response.data.product
}

export function getProductsState({ isLoading, error, products = [] }) {
  if (isLoading) return 'loading'
  if (error) return 'error'
  if (products.length === 0) return 'empty'
  return 'ready'
}

export function getStockLabel(stock) {
  return stock > 0 ? `${stock} in stock` : 'Out of stock'
}

export function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price)
}
