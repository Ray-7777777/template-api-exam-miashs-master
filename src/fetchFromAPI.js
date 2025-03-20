import fetch from 'node-fetch'

const API_URL = 'https://api-ugi2pflmha-ew.a.run.app'
const API_KEY = process.env.API_KEY

export async function fetchFromAPI(endpoint, params = {}) {
  const url = new URL(`${API_URL}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${await response.text()}`)
  }
  return response.json()
}
