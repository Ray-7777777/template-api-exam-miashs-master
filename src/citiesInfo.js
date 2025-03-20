import fetch from 'node-fetch'

const API_URL = 'https://api-ugi2pflmha-ew.a.run.app'
const API_KEY = process.env.API_KEY

async function fetchFromAPI(endpoint, params = {}) {
  const url = new URL(`${API_URL}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${await response.text()}`)
  }
  return response.json()
}

async function getCityInfo(cityId) {
  try {
    const cityData = await fetchFromAPI(`/cities/${cityId}/insights`, { apiKey: API_KEY })
    const weatherData = await fetchFromAPI('/weather-predictions', { cityId, apiKey: API_KEY })

    const formattedWeather = weatherData[0]?.predictions.map(pred => ({
      when: pred.when,
      min: pred.min,
      max: pred.max,
    })) || []

    return {
      coordinates: [cityData.coordinates.latitude, cityData.coordinates.longitude],
      population: cityData.population,
      knownFor: cityData.knownFor,
      weatherPredictions: formattedWeather.slice(0, 2), // Prend uniquement today & tomorrow
      recipes: []
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

export default async function citiesInfoRoute(fastify, options) {
  fastify.get('/cities/:cityId/infos', async (request, reply) => {
    const { cityId } = request.params
    try {
      const cityInfo = await getCityInfo(cityId)
      if (!cityInfo) {
        return reply.status(404).send({ success: false, error: 'City not found' })
      }
      return reply.send(cityInfo)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Internal Server Error' })
    }
  })
}
