const express= require('express')
const app = express()
const cors=require('cors')
const session = require('express-session')
const bodyParser = require('body-parser')  
const cookieParser= require('cookie-Parser')
require('dotenv').config()
const PORT=process.env.PORT || 4000
app.use(bodyParser.json()) 
/*
app.use(cors({
    origin:["http://localhost:3000"],
    methods:["GET","POST","PUT","DELETE"],
    allowedHeaders: "Content-Type, Authorization",
      exposedHeaders: "Authorization",
    credentials:true
}))*/
app.use(cors())     
app.use(session({
    key: "userId",
    secret: "secretKey",
    resave:false,
    saveUninitialized:false,
    cookie:{
        expires:60*60*24
    }
}))
app.use(cookieParser())
app.use(express.urlencoded({ extended:true })) 
app.use(require('./routes/index'))

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'testa',
  password: '1234',
  port: 5432,
  max:50
})

app.listen(PORT, function(){
    console.log('listening on port '+PORT)
    
})  

app.get("/info",(req,res)=>{
    if(!req.session.viewCount){
        req.session.viewCount=1
    }
    else{
        req.session.viewCount+=1
    }
    
    res.send("api funcionando correctamente"+req.session.viewCount)
})


