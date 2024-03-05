const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')
const twilio = require('twilio')

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioClient = twilio(accountSid, authToken);

const app = express()
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get("/recipes", async (req, res) => {
    try {
        const { q } = req.query;
        console.log(q)
        const response = await axios.get('https://api.edamam.com/search', {
            params: {
                q,
                app_id: process.env.EDAMAM_API_ID,
                app_key: process.env.EDAMAM_API_KEY
            },
        })

        res.json(response.data)
    }
    catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
})
app.post('/whatsapp', (req, res) => {
    const message = req.body.Body;
    const sender = req.body.From;
    console.log(`Message from ${sender}: ${message}`)

    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(`Hello! You sent: ${message}`);

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});

/* twilioClient.messages
    .create({
        body: 'Your appointment is coming up on July 21 at 3PM',
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+447767578251'
    })
    .then(message => console.log(message.sid))
    .done(); */

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});