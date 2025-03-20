import fetch from 'node-fetch';

const API_URL = 'https://api-ugi2pflmha-ew.a.run.app';
const API_KEY = process.env.API_KEY;

// Stockage en mémoire des recettes par ville
const cityRecipes = {};

// Fonction pour récupérer les villes existantes
async function cityExists(cityId) {
  try {
    const response = await fetch(`${API_URL}/cities/${cityId}/insights?apiKey=${API_KEY}`);
    return response.ok;
  } catch (error) {
    console.error("Error checking city:", error);
    return false;  // Return false if the request fails
  }
}

export default async function citiesRecipesRoute(fastify, options) {
  // Route pour ajouter une recette à une ville
  fastify.post('/cities/:cityId/recipes', async (request, reply) => {
    const { cityId } = request.params;
    const { content } = request.body;

    // Vérification de l'existence de la ville
    if (!(await cityExists(cityId))) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: `City ${cityId} not found`
      });
    }

    // Vérifications sur le contenu de la recette
    if (!content) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Recipe content is required'
      });
    }
    if (content.length < 10) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Recipe content is too short (minimum 10 characters)'
      });
    }
    if (content.length > 2000) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Recipe content is too long (maximum 2000 characters)'
      });
    }

    // Création d'un nouvel ID unique pour la recette
    const recipeId = Date.now();

    // Ajout de la recette en mémoire
    if (!cityRecipes[cityId]) {
      cityRecipes[cityId] = [];
    }
    cityRecipes[cityId].push({ id: recipeId, content });

    // Réponse avec la recette créée
    return reply.status(201).send({
      id: recipeId,
      content
    });
  });

  // Route pour supprimer une recette d'une ville
  fastify.delete('/cities/:cityId/recipes/:recipeId', async (request, reply) => {
    const { cityId, recipeId } = request.params;

    // Vérification de l'existence de la ville
    if (!(await cityExists(cityId))) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: `City ${cityId} not found`
      });
    }

    // Vérification si la ville contient des recettes
    if (!cityRecipes[cityId] || cityRecipes[cityId].length === 0) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: `No recipes found for city ${cityId}`
      });
    }

    // Recherche de la recette à supprimer
    const recipeIndex = cityRecipes[cityId].findIndex(recipe => recipe.id === parseInt(recipeId));

    if (recipeIndex === -1) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: `Recipe with id ${recipeId} not found`
      });
    }

    // Suppression de la recette
    cityRecipes[cityId].splice(recipeIndex, 1);

    // Réponse avec code de statut 204 pour "No Content"
    return reply.status(204).send();
  });
}
