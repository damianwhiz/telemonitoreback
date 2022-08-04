require('dotenv').config({path:"./.env"})
const express= require('express')
const bodyParser = require('body-parser')
const app = express()
const PORT=process.env.PORT || 3000
app.use(bodyParser.json())
app.use(express.urlencoded({ extended:false }))
app.use(require('./routes/index'))
app.listen(3000, function(){console.log('listening on port '+PORT)})



