import { fetchFromAPI } from './fetchFromAPI.js'

export default async function citiesRoutes(fastify) {
  // Route : Liste des villes avec option de recherche
  fastify.get('/cities', async (request, reply) => {
    try {
      const { search } = request.query
      const cities = await fetchFromAPI('/cities', { search, apiKey: process.env.API_KEY })
      return reply.send(cities)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Internal Server Error' })
    }
  })

  // Route : Infos complètes d'une ville
  fastify.get('/cities/:cityId/infos', async (request, reply) => {
    try {
      const { cityId } = request.params

      // Récupération des infos de la ville
      const cityData = await fetchFromAPI(`/cities/${cityId}/insights`, { apiKey: process.env.API_KEY })

      // Récupération des prévisions météo
      const weatherData = await fetchFromAPI(`/weather-predictions`, { cityId, apiKey: process.env.API_KEY })

      // Formatage des données
      const formattedWeather = weatherData[0]?.predictions.map(pred => ({
        when: pred.when,
        min: pred.min,
        max: pred.max,
      })) || []

      const response = {
        coordinates: [cityData.coordinates.latitude, cityData.coordinates.longitude],
        population: cityData.population,
        knownFor: cityData.knownFor,
        weatherPredictions: formattedWeather,
        recipes: []
      }

      return reply.send(response)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Internal Server Error' })
    }
  })
}
