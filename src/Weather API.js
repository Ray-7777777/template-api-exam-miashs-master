import { fetchFromAPI } from './fetchFromAPI.js'

export default async function weatherRoutes(fastify) {
  fastify.get('/weather/:cityId', async (request, reply) => {
    try {
      const { cityId } = request.params
      const weather = await fetchFromAPI('/weather-predictions', { cityId, apiKey: process.env.API_KEY })
      return reply.send(weather)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Internal Server Error' })
    }
  })
}
