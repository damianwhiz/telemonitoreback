const express= require('express')
const app = express()
const cors=require('cors')
const session = require('express-session')
const bodyParser = require('body-parser')  
const cookieParser= require('cookie-Parser')
const schedule = require('node-schedule');
const WA = require('./helper-function/whatsapp-send-message');
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
//BORRAR
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'telemonitoreo',
  password: '1234',
  port: 5432,
  max:50
})

schedule.scheduleJob('0 8 * * *',async()=>{
    try{
        pool.connect(async(error, client, release)=>{
         const response=await client.query("SELECT * FROM clients")
        for (let i=0; i<response.rows.length;i++){
            await WA.sendMessage(`Buenos dias ${response.rows[0].name}, este es su plan de monitoreo diario\nEstaremos consultando su estado de salud el dia de hoy.`,`whatsapp:+${response.rows[i].whatsapp}`)
            await WA.sendMessage(`Por favor, seleccione una de las siguientes opciones: \na) Quiero saber como tomarme la  presión arterial.\nb) Quiero reportar la medida de mi  Presión Arterial.\nc) Quiero reportar un síntoma.`,`whatsapp:+${response.rows[i].whatsapp}`)
        }
       })
     }
     catch(err){ 
       console.log(err)
     }
  }); 

  schedule.scheduleJob('0 8 * * *', async()=>{
    let transporter = nodemailer.createTransport({  
        service: 'gmail', 
          // true for 465, false for other ports 
          auth: {
            user: 'damian.duran@webleadsgroup.com', // generated ethereal user
            pass: 'owucgwndkhfcjpac', // generated ethereal password
          }  
          
        });

    try{
        pool.connect(async(error, client, release)=>{
         const response=await client.query("SELECT * FROM clients")
        for (let i=0; i<response.rows.length;i++){
            
            let id_cliente=response.rows[i].id
            let nameCliente=response.rows[i].name
            let lastnameCliente=response.rows[i].lastname
            const cuidadoresPaciente=await client.query("SELECT * FROM cuidadores WHERE id_cliente= $1",[id_cliente])
            for(let j=0; j<cuidadoresPaciente.rows.length; j++){
                //GENERO MAIL CON DATA DEL PACIENTE
                let mail=cuidadoresPaciente.rows[j].mail
                let name=cuidadoresPaciente.rows[j].name
                let lastname=cuidadoresPaciente.rows[j].lastname
                var mailOptions = {
                    from: '"ESTAR VITAL" <damian.duran@webleadsgroup.com>', // sender address
                    to: `${mail}`, // sender addresslist of receivers
                    subject: "Tu informe semanal!", // Subject line
                     // plain text body
                    html: `<h4>Buenos dias: ${name} ${lastname}<br>
                    Mensaje:</h4><br><br><br>
                    <h3> Nos comunicamos con usted para enviarle el informe semanal de ${nameCliente} ${lastnameCliente} para que pueda hacer un seguimiento de sus datos ingresados esta semana.
                    DATA QUE VIENE DE LABORATORIO
                    </h3>
                    <p>Que tenga una excelenta semana. Recuerde que puede ver sus registros dando click en el siguiente enlace:
                    www.loginempreesa.com`,
                    // html bod
                     
                  }
                transporter.sendMail(mailOptions,(error,info) => { 
                    console.log("senMail returned!");
                    if (error) {
                      console.log("ERROR!!!!!!", error);
                    } else {
                      console.log('Email sent: ' + info.response) 
                    }
                  });
            }
        }
       })
     }
     catch(err){ 
       console.log(err)
     }
  }
  )
/*
async function createDatabase() {
    pool.query('CREATE TABLE IF NOT EXISTS admin (id SERIAL PRIMARY KEY,username VARCHAR(50),password VARCHAR(50))',(err, res)=>{
        console.log(err)
    })
    pool.query('CREATE TABLE IF NOT EXISTS cuidadores (id SERIAL PRIMARY KEY,name VARCHAR(50),lastname VARCHAR(50),parentesco VARCHAR(50),id_cliente INTEGER,mail VARCHAR(50))',(err, res)=>{
        console.log(err)
    }) 
    pool.query('CREATE TABLE IF NOT EXISTS doctors (id SERIAL PRIMARY KEY,name VARCHAR(50), lastname VARCHAR(50),username VARCHAR(50),password VARCHAR(50),codigo VARCHAR(50))',(err, res)=>{
        console.log(err)
    })
    pool.query('CREATE TABLE IF NOT EXISTS clients (id SERIAL PRIMARY KEY,name VARCHAR(50), lastname VARCHAR(50),username VARCHAR(50),password VARCHAR(50),mail VARCHAR(50),dni VARCHAR(50),whatsapp VARCHAR(50), id_enfermero INTEGER, enfermedad INTEGER, id_doctor INTEGER, registrado BOOLEAN)',(err, res)=>{
        console.log(err)
    })
    pool.query('CREATE TABLE IF NOT EXISTS nurses (id SERIAL PRIMARY KEY,name VARCHAR(50), lastname VARCHAR(50),username VARCHAR(50),password VARCHAR(50))',(err, res)=>{
        console.log(err)
    })
    pool.query('CREATE TABLE IF NOT EXISTS operator (id SERIAL PRIMARY KEY,username VARCHAR(50),password VARCHAR(50))',(err, res)=>{
        console.log(err)
    })
    pool.query('CREATE TABLE IF NOT EXISTS enfermedad (id SERIAL PRIMARY KEY,name VARCHAR(50))',(err, res)=>{
        console.log(err)
    })
    pool.query('CREATE TABLE IF NOT EXISTS indicadores (id SERIAL PRIMARY KEY,name VARCHAR(50), min_value INTEGER, max_value INTEGER, description VARCHAR(250))',(err, res)=>{
        console.log(err)
    })
    pool.query('CREATE TABLE IF NOT EXISTS sintomas (id SERIAL PRIMARY KEY,name VARCHAR(50),description VARCHAR(250))',(err, res)=>{
        console.log(err)
    })
    pool.query('CREATE TABLE IF NOT EXISTS sintomas_paciente (id SERIAL PRIMARY KEY,id_paciente INTEGER,id_sintoma INTEGER)',(err, res)=>{
        console.log(err) 
    })
    
    pool.query('CREATE TABLE IF NOT EXISTS registros_vitales (id SERIAL PRIMARY KEY,temperatura INTEGER,presion_arterial_a INTEGER, presion_arterial_b INTEGER, frecuencia_respiratoria INTEGER,frecuencia_cardiaca INTEGER ,saturacion_oxigeno INTEGER, peso INTEGER,imc INTEGER,grasa_corporal INTEGER,perimetro_abdominal INTEGER,reaccion_orina INTEGER,beg INTEGER,reg INTEGER,meg INTEGER,estilo_vida VARCHAR (250),signos VARCHAR(250),estado_general INTEGER, id_client INTEGER, date DATE DEFAULT CURRENT_DATE)',(err, res)=>{
        console.log(err) 
    })
    
  } 
*/
app.listen(PORT, function(){
    console.log('listening on port '+PORT)
   // createDatabase()
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


