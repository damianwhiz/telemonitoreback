const express= require('express')
const bodyParser = require('body-parser')
const app = express()
require('dotenv').config({path:"./.env"})
const PORT=process.env.PORT || 3000
app.use(bodyParser.json())
app.listen(3000, function(){console.log('listening on port '+PORT)})



app.get('/testing', function(req, res){
    res.send("teestin")
})