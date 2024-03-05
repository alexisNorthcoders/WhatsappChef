const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')

const app = express()
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get("/recipes",async (req,res)=>{
    try{
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
    catch(err){
        console.log(err)
        res.status(500).send(err)
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });