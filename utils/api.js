const axios = require('axios')
const twilio = require('twilio')

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER
const twilioClient = twilio(accountSid, authToken);

function fetchRecipe(message) {
    console.log(message)
    const params = parseMessage(message)
    console.log(params, "params")
    const queryParams = {
        q: params.ingredients || '',
        diet: params.diet || null, 
        health: params.health || null,
        cuisineType: params.cuisine || null, 
        mealType: params.meal || null, 
        calories: params.calories || null, 
        app_id: process.env.EDAMAM_API_ID,
        app_key: process.env.EDAMAM_API_KEY
    };


    return axios.get('https://api.edamam.com/search', {
        params: queryParams
    }).then(({ data: { hits } }) => {
        const recipes = hits.map((recipe) => {

            return {
                title: recipe.recipe.label,
                ingredients: recipe.recipe.ingredientLines,
                image: recipe.recipe.image,
                type: recipe.recipe.cuisineType.join(", "),
                calories: recipe.recipe.calories,
                servings: recipe.recipe.yield,
                caloriesPerServing: Math.round(recipe.recipe.calories / recipe.recipe.yield),
                link: recipe.recipe.url
            }
        })
        return recipes
    })

}

function formatIngredients(ingredients) {
    return ingredients.map(ingredient => `\u2022 ${ingredient}`).join('\n');
}
function parseMessage(message) {

    const parts = message.split(';');

    const params = {};

    parts.forEach(part => {
        const [key, value] = part.split(':').map(item => item.trim());
        params[key.replace(/\s/g, '')] = value;
    });
    return params;
}

async function sendRecipe(sender, recipe) {

    const formattedIngredients = formatIngredients(recipe.ingredients)
    const messageBody = `*Recipe:* ${recipe.title}\n\n\u2728 *Ingredients:*\n${formattedIngredients}\n\n🍽 *Cuisine:*\n${recipe.type}\n\n🔥 *Calories:*\n${recipe.caloriesPerServing}\n\n🔗 *URL:*\n${recipe.link}`;

    twilioClient.messages
        .create({
            body: messageBody,
            mediaUrl: [recipe.image],
            from: twilioNumber,
            to: sender
        })
        .then(message => console.log('Message sent:', message.sid))
        .catch(error => console.error('Error sending message:', error));
}

module.exports = { fetchRecipe, sendRecipe }