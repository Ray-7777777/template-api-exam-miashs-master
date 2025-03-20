import 'dotenv/config'
import Fastify from 'fastify'
import { submitForReview } from './submission.js'
import citiesInfoRoute from './citiesInfo.js'
import citiesRecipesRoute from './citiesRecipes.js' // Import de la nouvelle route

const fastify = Fastify({ logger: true })

// Enregistrer la route pour récupérer les infos d'une ville
fastify.register(citiesInfoRoute)

// Enregistrer la route pour ajouter des recettes à une ville
fastify.register(citiesRecipesRoute)

fastify.listen(
  {
    port: process.env.PORT || 3000,
    host: process.env.RENDER_EXTERNAL_URL ? '0.0.0.0' : process.env.HOST || 'localhost',
  },
  function (err) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
    
    ///////////////////////////////////////////////////////////////////////
    // Don't delete this line, it is used to submit your API for review  //
    // everytime your start your server.                                 //
    ///////////////////////////////////////////////////////////////////////
    submitForReview(fastify) // Soumission automatique
  }
)
