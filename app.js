const express = require('express')
const bodyParser = require('body-parser')
const twilio = require('twilio')
const { fetchRecipe, sendRecipe } = require('./utils/api')


const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioClient = twilio(accountSid, authToken);

const app = express()
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/recipes', (req, res) => {
    const { q } = req.query

    fetchRecipe(q).then((response) => res.send(response))
        .catch(err => res.send(err))
})
app.post('/whatsapp', async (req, res) => {
    const message = req.body.Body;
    const sender = req.body.From;
    console.log(`Message from ${sender}: ${message}`)
    try {
        if (message.toLowerCase() === '!help') {

            const helpMessage = `
🍽️ **Recipe Search Help** 🍲

Here are the available query options for recipe searches:

🥦 **Ingredients**: Specify ingredients to search (e.g., chicken, pasta)
🍏 **Diet**: Specify diet type (e.g., balanced, high-fiber, high-protein, low-carb, low-sodium, low-fat)
❤️‍🔥 **Health**: Specify health labels to exclude (e.g., vegan, vegetarian, egg-free, gluten-free, dairy-free, crustacean-free, DASH, fish-free, keto-friendly, kosher, low-sugar, paleo, peanut-free)
🌎 **Cuisine**: Specify the type of cuisine (e.g., Nordic, Middle Eastern, American, Asian, French, Italian, Japanese, Indian)
🍽️ **Meal**: Specify the type of meal (e.g., Breakfast, Dinner, Lunch, Snack, Teatime)
🍲 **Dish**: Specify the dish type (e.g., Bread, Main course, Preps, Salad, Sandwiches, Side dish, Starter, Sweets)
🔥 **Calories**: Give a range of calories (e.g., calories:200-600)
`;
            const message = await twilioClient.messages.create({
                body: helpMessage,
                from: 'whatsapp:+14155238886',
                to: sender
            })
            console.log(message)
            res.status(200).end()
        }
        else if (message.includes("ingredients")) {
            const recipes = await fetchRecipe(message)
            recipes.slice(5).forEach((recipe) => sendRecipe(sender, recipe))
        }
        else {
            const twiml = new twilio.twiml.MessagingResponse();
            twiml.message(`Hello! You sent: ${message}`);

            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(twiml.toString());
        }
    }
    catch (err) {
        console.error('Error sending message:', err)
        res.status(500).send("error sending message")
    };

})

app.get('/whatsapp', (req, res) => {
    res.send("This is a Whatsapp Chef Assistant")
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});