
const bcrypt = require('bcrypt')
const saltRounds=10
const jwt = require('jsonwebtoken');
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'telemonitoreo',
  password: '1234',
  port: 5432,
  max:50
})


//VERIFICAR TOKEN AGREGAR DEPSPUES  
const verificarToken=(req, res, next) => {
   
    const token = req.headers.authorization.split(' ')[1]
    
    if(!token){
      res.send("token is neccesary for this action")
    }  
    else{  
      jwt.verify(token,"miclavecilla")             
      next()       
    } 
}




//CLIENTES
const getClients=async(req,res)=>{
    try{
       pool.connect(async(error, client, release)=>{
        const response=await client.query("SELECT * FROM clients")
        res.send(response.rows)
      })
    }
    catch(err){
      console.log(err)
    }
    
}
const newClient=async(req, res)=>{
  const name=req.body.name
  const lastname=req.body.lastname
  const mail=req.body.mail
  const username=req.body.username
  const password=req.body.password
  const dni=req.body.dni
  const whatsapp=req.body.whatsapp
  const id_doctor=req.body.doctor   
  const id_enfermero=req.body.enfermero  
  

  try{
  bcrypt.hash(password,saltRounds,async(error,hash)=>{await pool.query('INSERT INTO clients(name,lastname,mail,username,password,dni,whatsapp,id_doctor,id_enfermero) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',[name,lastname,mail,username,hash,dni,whatsapp,id_doctor,id_enfermero])}) 
  
  res.status(200).send("user created successfully")  
  } 
  catch(err){ 
    console.log(err)
  } 
} 
const getUserById = async(req, res)=>{        
  const id=req.params.id
  const response=await pool.query('SELECT * FROM clients WHERE id=$1',[id])
  res.send(response.rows)
}
const deleteUserById = async(req, res)=>{
  const id=req.params.id
  const response=await pool.query('DELETE FROM clients WHERE id=$1',[id])
  res.send("usuario eliminado exitosamente")
}
const updateUserById = async(req, res)=>{
  const id=req.params.id
  const mail=req.body.mail
  const password=req.body.password
  console.log(mail, password,id)
  try{
    bcrypt.hash(password,saltRounds,async(error,hash)=>{await pool.query('UPDATE clients SET mail=$1,password=$2 WHERE id=$3',[mail,hash,id]) }) 
    console.log("guardado")
    res.status(200).send("user created successfully") 
    } 
    catch(err){ 
      console.log(err)
    } 
  
  
}
const loginUser= async(req, res)=>{ 
  const username=req.body.username  
  const password=req.body.password
  console.log(username,password)
  try{
    pool.connect(async(error, client, release)=>{
     const response=await client.query("SELECT * FROM clients WHERE username=$1",[username])
      if(response.rows.length>0){
      const autorizado = await bcrypt.compare(password , response.rows[0].password)
      if(!autorizado){
        res.send("usuario/contraseña no valido")
      }
       else{ 
        const payload={ 
          id: response.rows[0].id,
          whatsapp: response.rows[0].whatsapp 
        }
        const token = jwt.sign(payload,"miclavecilla")
        return res.send({payload, token})
       }
     }
     else{
       res.send("usuario no encontrado")
     }
     
       
  })
}
catch(err){   
  res.send("error interno")
}
  
}
const infoClients =async(req, res)=>{
    const whatsapp=req.params.whatsapp
    try{
      pool.connect(async(error, client, release)=>{
       const infoUsuario=[]
       const registros=await client.query("SELECT * FROM registers WHERE whatsapp=$1",[whatsapp]).then(e=>{return e.rows})
       const cliente=await client.query("SELECT * FROM clients WHERE whatsapp=$1",[whatsapp]).then(e=>{return (
        {
        name:e.rows[0].name,
        lastname:e.rows[0].lastname,
        username:e.rows[0].username,
        mail:e.rows[0].mail,
        dni:e.rows[0].dni,
        whatsapp:e.rows[0].whatsapp,
        doctor:e.rows[0].id_doctor,
        enfermero:e.rows[0].id_enfermero}) 
      })
      infoUsuario.push(cliente)
      infoUsuario.push(registros)
       res.status(200).send(infoUsuario)
    })
  }
  catch(err){
    console.log(err)
  }
 
}





const loginAdmin= async(req, res)=>{
  const username=req.body.username
  const password=req.body.password
  try{
    pool.connect(async(error, client, release)=>{
     const response=await client.query("SELECT * FROM admin WHERE username=$1",[username])
     if(response.rows.length>0){
       if(response.rows[0].password==password && response.rows[0].username){
         res.send(response.rows[0]) 
          
       }
       else{
         res.send("error en contraseña/login")   
       }
     }
     else{
       res.send("usuario no encontrado")
     }
     
       
  })
}
catch(err){   
  res.send("error interno")
}
}


//NURSES
const newNurse=async(req, res)=>{
  const name=req.body.name
  const lastname=req.body.lastname
  const username=req.body.username
  const password=req.body.password
  const dni=req.body.dni
  try{
    bcrypt.hash(password,saltRounds,async(error,hash)=>{
    const response=await pool.query('INSERT INTO nurses(name,lastname,username,password,dni) VALUES ($1,$2,$3,$4,$5)',[name,lastname,username,hash,dni])
    console.log(response)
    res.send("user created successfully")
  })}
  catch(err){  
    console.log(err) 

  }
  
}
const loginNurse= async(req, res)=>{ 
  const username=req.body.username
  const password=req.body.password
  try{
    pool.connect(async(error, client, release)=>{
     const response=await client.query("SELECT * FROM nurses WHERE username=$1",[username])
      if(response.rows.length>0){
      const autorizado = await bcrypt.compare(password , response.rows[0].password)
      if(!autorizado){
        res.send("usuario/contraseña no valido")
      }
       else{
        const payload={
          id: response.rows[0].id,
          whatsapp: response.rows[0].whatsapp 
        }
        const token = jwt.sign(payload,"miclavecilla")
        return res.send({payload, token})
       }
     }
     else{
       res.send("usuario no encontrado")
     }
     
       
  })
}
catch(err){   
  res.send("error interno")
}
}
const infoNurse= async(req, res)=>{
  const id=req.params.id
  console.log("llegamos aqui desde front")
  const allClients=[]
  try{
    pool.connect(async(error, client)=>{
     const clientes=await client.query(`SELECT * FROM clients WHERE id_enfermero = $1`,[id])
     const enfermero=await client.query(`SELECT * FROM nurses WHERE id= $1`,[id])
     allClients.push(enfermero.rows[0])
    for(let i=0; i<clientes.rows.length; i++){
      var data=await client.query(`SELECT * FROM registers WHERE whatsapp = $1`,[clientes.rows[i].whatsapp])
      var dataTotalCliente={nombre:clientes.rows[i].name,apellido:clientes.rows[i].lastname,id:clientes.rows[i].id,registros:data.rows}
      allClients.push(dataTotalCliente)
    }
     res.send(allClients)  
   })
 }
 catch(err){
   console.log(err)
 }
  
}
const updateInfo= async(req, res)=>{
  
   const idCliente = req.params.idCliente
   const {temperatura,presionArterial,frecuenciaRespiratoria,frecuenciaCardiaca,saturacionOxigeno,peso,imc,grasaCorporal,perimetroAbdominal,reaccionOrina,beg,reg,meg,estiloVida,signos,estadoGeneral}=req.body
   
   try{
      pool.connect(async(error, client)=>{  
       const response=await pool.query('INSERT INTO registros_vitales(temperatura,presion_arterial,frecuencia_respiratoria,frecuencia_cardiaca,saturacion_oxigeno,peso,imc,grasa_corporal,perimetro_abdominal,reaccion_orina,beg,reg,meg,estilo_vida,signos,id_client,estado_general) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)',[temperatura,presionArterial,frecuenciaRespiratoria,frecuenciaCardiaca,saturacionOxigeno,peso,imc,grasaCorporal,perimetroAbdominal,reaccionOrina,beg,reg,meg,estiloVida,signos,idCliente,estadoGeneral])
       res.send("data updated successfully")
     })
   }
   catch(err){
     console.log(err)
   }
}


const getNurses=(req,res)=>{
  try{
     pool.connect(async(error, client)=>{
      const response=await client.query("SELECT * FROM nurses")
      res.send(response.rows)
    })
  }
  catch(err){
    console.log(err)  
  } 
  
}






//DOCTORS
const getDoctors=async(req,res)=>{

  
  try{
     pool.connect(async(error, client, release)=>{
      const response=await client.query("SELECT * FROM doctors")
      res.send(response.rows)
    })
  }
  catch(err){
    console.log(err)
  }
  
}
const newDoctor=async(req, res)=>{
  const name=req.body.name
  const lastname=req.body.lastname
  const username=req.body.username
  const password=req.body.password
  const dni=req.body.dni
  const codigo=req.body.codigo
  console.log(name, lastname,username, password,dni,codigo)
  try {
  bcrypt.hash(password,saltRounds,async(error,hash)=>{
    await pool.query('INSERT INTO doctors(name,lastname,username,password,dni,codigo) VALUES ($1,$2,$3,$4,$5,$6)',[name,lastname,username,hash,dni,codigo])
    res.send("user created successfully")
  })}
  catch(err){ 
    console.log(err)
  }
  
}
const loginDoctor= async(req, res)=>{
  const username=req.body.username
  const password=req.body.password
  try{
    pool.connect(async(error, client, release)=>{
     const response=await client.query("SELECT * FROM doctors WHERE username=$1",[username])
      if(response.rows.length>0){
      const autorizado = await bcrypt.compare(password , response.rows[0].password)
      if(!autorizado){
        res.send("usuario/contraseña no valido")
      }
       else{
        const payload={
          id: response.rows[0].id,
          whatsapp: response.rows[0].whatsapp 
        }
        const token = jwt.sign(payload,"miclavecilla")
        return res.send({payload, token})
       }
     }
     else{
       res.send("usuario no encontrado")
     }
     
       
  })
}
catch(err){   
  res.send("error interno")
}
}
const infoDoctor = async(req, res)=>{
  console.log("pasaste por info doctor")
  const id=req.params.id
  const allClients=[]
  try{
    pool.connect(async(error, client)=>{
     const clientes=await client.query(`SELECT * FROM clients WHERE id_doctor = $1`,[id])
     const doctor=await client.query(`SELECT * FROM doctors WHERE id = $1`,[id])
    for(let i=0; i<clientes.rows.length; i++){
      var data=await client.query(`SELECT * FROM registers WHERE whatsapp = $1`,[clientes.rows[i].whatsapp])
      var dataTotalCliente={nombre:clientes.rows[i].name,registros:data.rows}
      allClients.push(dataTotalCliente)
    }
     res.json({doctor:doctor.rows,clientes:allClients})
   })
 }
 catch(err){ 
   console.log(err)  
 }
} 



const WA = require('../helper-function/whatsapp-send-message');

const whatsapp=async(req, res)=>{
 
  let message = req.body.Body; 
  let senderID = req.body.From; 
  if (message.length == 1){  
    message=Number(message)
    }
    else{
      console.log("estamos en string");
    }
    let fecha = new Date().toISOString().slice(0, 10)

    
 const number = await senderID.replace(/\D/g, '');  
  //CHEQUEO POR ENFERMEDADES
  pool.connect(async(error, client, release)=>{
    const response=await client.query("SELECT * FROM clients WHERE whatsapp = $1",[number])
    //CHEQUEO SI ENFERMEDAD ES DIABETES
    if(response.rows[0].enfermedad==1){
      pool.connect(async(error, client, release)=>{
        const response=await client.query("SELECT * FROM registers WHERE date = $1 AND whatsapp = $2",[fecha,number])
        if(response.rows.length>=1){
          if(response.rows[0].second_question==null){ 
            await WA.sendMessage('Entendido!💪🏻. Has seguido tu dieta de forma correcta el dia de hoy?🤔 ', senderID);
            await pool.query('UPDATE registers SET second_question = $1 WHERE whatsapp = $2',[message,number])
            
          }
          else if(response.rows[0].third_question==null){
            await WA.sendMessage('Excelente, guardamos su estado correctamente 🙌🏻. Cualquier duda o inconveniente comuníquese con un miembro de nuestro equipo. Muchas gracias por confiar en nosotros 😊  ', senderID);
            await pool.query('UPDATE registers SET third_question = $1 WHERE whatsapp = $2',[message,number])
          }
          else{
            await WA.sendMessage('Hemos registrado su informacion diaria de forma correcta. Si desea comunicar otra cosa mas, pongase en contacto con su cuidador. Muchas gracias! ', senderID);
          }
        }
    
        
        else if(typeof message === 'number'){
          await WA.sendMessage('Hemos registrado su informacion!🙌🏻. Ahora, ha tomado sus pastillas el dia de hoy?🤔 ', senderID);
          await pool.query('INSERT INTO registers(first_question,whatsapp) VALUES ($1,$2)',[message,number])
          
        }
        else{
          await WA.sendMessage('Buenos dias!😊 Este es su plan de monitoreo diario. En una escala del 1 al 5, como se siente hoy? ', senderID);
        } 
    
    
      })




    }
    //CHEQUEO SI ENFERMEDAD ES ARTRITIS
    if(response.rows[0].enfermedad==2){
      pool.connect(async(error, client, release)=>{
        const response=await client.query("SELECT * FROM registers WHERE date = $1 AND whatsapp = $2",[fecha,number])
        if(response.rows.length>=1){
          if(response.rows[0].second_question==null){ 
            await WA.sendMessage('Entendido. Has sentido hinchazon o esperimentado algun tipo de enrojecimiento en alguna articulación? ', senderID);
            await pool.query('UPDATE registers SET second_question = $1 WHERE whatsapp = $2',[message,number])
            
          }
          else if(response.rows[0].third_question==null){
            await WA.sendMessage('Excelente, guardamos su estado correctamente 🙌🏻. Cualquier duda o inconveniente comuníquese con un miembro de nuestro equipo. Muchas gracias por confiar en nosotros 😊  ', senderID);
            await pool.query('UPDATE registers SET third_question = $1 WHERE whatsapp = $2',[message,number])
          }
          else{
            await WA.sendMessage('Hemos registrado su informacion diaria de forma correcta. Si desea comunicar otra cosa mas, pongase en contacto con su cuidador. Muchas gracias! ', senderID);
          }
        }
    
        
        else if(typeof message === 'number'){
          await WA.sendMessage('Hemos registrado su informacion!🙌🏻. Ahora, ha tomado sus pastillas el dia de hoy?🤔 ', senderID);
          await pool.query('INSERT INTO registers(first_question,whatsapp) VALUES ($1,$2)',[message,number])
          
        }
        else{
          await WA.sendMessage('Buenos dias!😊 Este es su plan de monitoreo diario. En una escala del 1 al 5, como se siente hoy? ', senderID);
        } 
    
    
      })
    }

    //CHEQUEO SI ENFERMEDAD ES OSTEOPOROSIS
    if (response.rows[0].enfermedad==3){
      pool.connect(async(error, client, release)=>{
        const response=await client.query("SELECT * FROM registers WHERE date = $1 AND whatsapp = $2",[fecha,number])
        if(response.rows.length>=1){
          if(response.rows[0].second_question==null){ 
            await WA.sendMessage('De acuerdo.Te ha dolido la espalda el dia de hoy? 🤔 ', senderID);
            await pool.query('UPDATE registers SET second_question = $1 WHERE whatsapp = $2',[message,number])
            
          }
          else if(response.rows[0].third_question==null){
            await WA.sendMessage('Excelente, guardamos su estado correctamente 🙌🏻. Cualquier duda o inconveniente comuníquese con un miembro de nuestro equipo. Muchas gracias por confiar en nosotros 😊  ', senderID);
            await pool.query('UPDATE registers SET third_question = $1 WHERE whatsapp = $2',[message,number])
          }
          else{
            await WA.sendMessage('Hemos registrado su informacion diaria de forma correcta. Si desea comunicar otra cosa mas, pongase en contacto con su cuidador. Muchas gracias! ', senderID);
          }
        }
    
        
        else if(typeof message === 'number'){
          await WA.sendMessage('Hemos registrado su informacion!🙌🏻. Ahora, ha tomado sus pastillas el dia de hoy?🤔 ', senderID);
          await pool.query('INSERT INTO registers(first_question,whatsapp) VALUES ($1,$2)',[message,number])
          
        }
        else{
          await WA.sendMessage('Buenos dias!😊 Este es su plan de monitoreo diario. En una escala del 1 al 5, como se siente hoy? ', senderID);
        } 
    
    
      })
    }
 

    //CHEQUEO SI ENFERMEDAD ES HIPERTENSION
    if(response.rows[0].enfermedad==4){
      
      pool.connect(async(error, client, release)=>{
        const response=await client.query("SELECT * FROM registers WHERE date = $1 AND whatsapp = $2",[fecha,number])
        if(response.rows.length>=1){
          if(response.rows[0].second_question==null){ 
            await WA.sendMessage('Entendido!💪🏻. Se te ha subido la presión el dia de hoy? 🤕 ', senderID);
            await pool.query('UPDATE registers SET second_question = $1 WHERE whatsapp = $2',[message,number])
            
          }
          else if(response.rows[0].third_question==null){
            await WA.sendMessage('Excelente, guardamos su estado correctamente 🙌🏻. Cualquier duda o inconveniente comuníquese con un miembro de nuestro equipo. Muchas gracias por confiar en nosotros 😊  ', senderID);
            await pool.query('UPDATE registers SET third_question = $1 WHERE whatsapp = $2',[message,number])
          }
          else{
            await WA.sendMessage('Hemos registrado su informacion diaria de forma correcta. Si desea comunicar otra cosa mas, pongase en contacto con su cuidador. Muchas gracias! ', senderID);
          }
        }
    
        
        else if(typeof message === 'number'){
          await WA.sendMessage('Hemos registrado su informacion!🙌🏻. Ahora, ha tomado sus pastillas el dia de hoy?🤔 ', senderID);
          await pool.query('INSERT INTO registers(first_question,whatsapp) VALUES ($1,$2)',[message,number])
          
        }
        else{
          await WA.sendMessage('Buenos dias!😊 Este es su plan de monitoreo diario. En una escala del 1 al 5, como se siente hoy? ', senderID);
        } 
    
    
      })
    }



  })
 
}


const newhatsapp=async(req, res)=>{
  let message = req.body.Body; 
  let senderID = req.body.From;
  let whatsapp=req.body.WaId
  let fecha = new Date().toISOString().slice(0, 10) 
  
    pool.connect(async(error, client, release)=>{
    const response=await client.query("SELECT * FROM clients WHERE whatsapp = $1",[whatsapp])
    let id_paciente=response.rows[0].id
    const registro=await client.query("SELECT * FROM registros_vitales WHERE id_client = $1",[id_paciente])
    const flujo_whatsapp=await client.query("SELECT * FROM flujo_whatsapp WHERE date=$1 AND id_whatsapp = $2",[fecha,whatsapp])
    
    //VERIFICAR SI EL PACIENTE ENVIO VALOR DE PRESION ARTERIAL
    let valuePA=message.includes('/')
  if(valuePA){
    let numerador=message.split('/')[0]
    let denomidador=message.split('/')[1]
    if(numerador>120){
      await WA.sendMessage('Su presión  esta muy alta. Se  recomienda ir a un  establecimiento de  salud.',senderID)
      await pool.query('UPDATE flujo_whatsapp SET tercer_flujo = $1 WHERE id_whatsapp = $2 AND date= $3',[true,whatsapp,fecha])
    }
    if(denomidador>85){
      await WA.sendMessage('Su presión arterial es alta. Hemos registrado sus datos.\nPuede agendar una cita con su medico',senderID)
      await pool.query('UPDATE flujo_whatsapp SET tercer_flujo = $1 WHERE id_whatsapp = $2 AND date= $3',[true,whatsapp,fecha])
    }
    if(numerador<=120 && denomidador <= 85){
      await WA.sendMessage('Su presión arterial es normal.\n Buen trabajo.',senderID)
      await pool.query('UPDATE flujo_whatsapp SET tercer_flujo = $1 WHERE id_whatsapp = $2 AND date= $3',[true,whatsapp,fecha])
    }
  }


    if(response.rows[0]==0){
      await WA.sendMessage('Su usuario no se encuentra registrado en nuestra base de datos, por favor pongase en contacto con su doctor',senderID)
    }
    else if(response.rows[0]>=0 && response.rows[0].registrado==false){
      await WA.sendMessage(`Buenos dias ${response.rows[0].name}, por lo visto aun no tienes acceso a nuestro plan de monitoreo, por favor ponte en contacto con tu doctor.`, senderID);
    }
    if(flujo_whatsapp.rows.length==0){
      await WA.sendMessage(' Hola, Te damos la bienvenida al servicio de Telemonitoreo de Estar Vital.\nMediante este chat podremos acompañarte en el seguimiento de tus sintomas y otros indicadores de tu salud', senderID);
      await WA.sendMessage(' Antes que empecemos a contarte como funciona el servicio queremos decirte algo muy importante.\nLa información que brindarás por  este chat es completamente  confidencial y solo tu médico  tratante y el personal de salud de  Estar Vital podrá acceder a ello. De  esta manera estaremos más  pendientes de tu salud.', senderID);
      await WA.sendMessage('Te enviaremos un video  introducción para contarte como  es el servicio, espero lo disfrutes.',senderID)
      await WA.sendMessage('http://www.youtube.com/watch?v=k35M-Rlrlxw',senderID)
      await WA.sendMessage(' Te estaremos enviado  mensaje de vez en cuando para  saber como va tu salud.\n ¿Deseas hacer algo ahora? Te  damos estas opciones: \n a) Quiero saber como tomarme la  presión arterial.\n b) Quiero reportar la medida de mi  Presión Arterial.\n c) Quiero reportar un síntoma.',senderID)
      await pool.query('INSERT INTO flujo_whatsapp(primer_flujo,id_whatsapp) VALUES ($1,$2)',[true,whatsapp])
    }  
    if(flujo_whatsapp.rows.length>0 && message!="a" && message!="A" && message!="b" && message!="B" && message!="c" && message!="C" && valuePA==false){
      await WA.sendMessage('Por favor, seleccione una de las siguientes opciones: \n a) Quiero saber como tomarme la  presión arterial.\n b) Quiero reportar la medida de mi  Presión Arterial.\n c) Quiero reportar un síntoma.',senderID)
      await pool.query('UPDATE flujo_whatsapp SET segundo_flujo = $1 WHERE id_whatsapp = $2 AND date= $3',[true,whatsapp,fecha])
    }
 
  
    if(message=="A" || message=="a" || message=="AA" || message=="aa" || message=="Aa" || message=="aA"){
      await WA.sendMessage('Video de Tomar  presion arterial en  casa:',senderID)
      await WA.sendMessage('https://www.youtube.com/watch?v=dCjk5ebxEWY&t=10s',senderID)
      await WA.sendMessage('b) Quiero reportar la medida de mi Presión Arterial.\nc) Quiero reportar un síntoma.',senderID)
      
    }

  })
  
  
    
  if(message=="B" || message=="b" || message=="BB" || message=="bb" || message=="Bb" || message=="bB"){
    await WA.sendMessage('¿Cuanto fue tu presión anterial?  recuerda que debes escribirlo en  fracción (ej: 120/70)',senderID)
  }
  if(message=="C" || message=="c" || message=="CC" || message=="cc" || message=="Cc" || message=="cC"){
    await WA.sendMessage('Escribe la letra de estas ocpiones\n(selecciona 1)\n1) Dolor de Cabeza\n2) Sensación de falta de aire\n3) Dolor en el pecho\n4) Dolor en el brazo izquierdo\n5) Mareos',senderID)
    if(message=="a"){
      await pool.query('INSERT INTO sintomas_paciente(id_sintoma,id_paciente) VALUES ($1,$2)',["Dolor de cabeza",senderID])
      await WA.sendMessage('Estamos reportando a la central de Estar Vital',senderID)
      await WA.sendMessage('¿Otro síntoma?',senderID)
    }
    else if(message=="b"){
      await pool.query('INSERT INTO sintomas_paciente(id_sintoma,id_paciente) VALUES ($1,$2)',["Sensación de falta de aire",senderID])
      await WA.sendMessage('Estamos reportando a la central de Estar Vital',senderID)
      await WA.sendMessage('¿Otro síntoma?',senderID)
    }
    else if(message=="c"){
      await pool.query('INSERT INTO sintomas_paciente(id_sintoma,id_paciente) VALUES ($1,$2)',["Dolor en el pecho",senderID])
      await WA.sendMessage('Estamos reportando a la central de Estar Vital',senderID)
      await WA.sendMessage('¿Otro síntoma?',senderID)
    }
    else if(message=="d"){
      await pool.query('INSERT INTO sintomas_paciente(id_sintoma,id_paciente) VALUES ($1,$2)',["Dolor en el brazo izquierdo",senderID])
      await WA.sendMessage('Estamos reportando a la central de Estar Vital',senderID)
      await WA.sendMessage('¿Otro síntoma?',senderID)
    }
    else if(message=="d"){
      await pool.query('INSERT INTO sintomas_paciente(id_sintoma,id_paciente) VALUES ($1,$2)',["Mareos",senderID])
      await WA.sendMessage('Estamos reportando a la central de Estar Vital',senderID)
      await WA.sendMessage('¿Otro síntoma?',senderID)
    }
    else{
      await WA.sendMessage('Por favor escriba un valor válido',senderID)
    }

    }
  


}


const mail= async(req, res)=>{
  const mail=req.body.mail
  const name=req.body.name
  const lastname=req.body.lastname
  const pills=req.body.pills
  const head=req.body.head
  const general=req.body.general
  const vital_sign=req.body.vital_sign
  const item=req.body.item
  let transporter = nodemailer.createTransport({  
    service: 'gmail', 
      // true for 465, false for other ports 
      auth: {
        user: 'damian.duran@webleadsgroup.com', // generated ethereal user
        pass: 'owucgwndkhfcjpac', // generated ethereal password
      }  
      
    });



    var mailOptions = {
      from: '"Nombre empresa" <damian.duran@webleadsgroup.com>', // sender address
      to: `${mail}`, // sender addresslist of receivers
      subject: "Tu informe semanal!", // Subject line
       // plain text body
      html: `<h4>Buenos dias: ${name} ${lastname}<br>
      Mail de contacto: ${mail}<br>
      Mensaje:</h4><br><br><br>
      <h3> Nos comunicamos con usted para enviarle su informe semanal para que pueda hacer un seguimiento de sus datos ingresados esta semana.
      Usted ha informado que ${pills} ha tomado sus pastillas, que ${head} ha tenido dolor de cabeza durante la semana,
      que sus signos vitales han sido de ${vital_sign}, que se ha sentido en un promedio general de ${general}.
      Adicionalente ${item}</h3>
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
const loginOperador= async(req, res)=>{
  const username=req.body.username
  const password=req.body.password

  
  try{
     pool.connect(async(error, client, release)=>{
      const response=await client.query("SELECT * FROM operator WHERE username=$1",[username])
      if(response.rows.length>0){
        if(response.rows[0].password==password && response.rows[0].username){
          res.send(response.rows[0]) 
           
        }
        else{
          res.send("error en contraseña/login")   
        }
      }
      else{
        res.send("usuario no encontrado")
      }
      
        
   })
 }
 catch(err){   
   res.send("error interno")
 }

} 
const updateOperadorInfo= async(req, res)=>{ 
  const pill=req.body.pill 
  const head=req.body.head
  const general=req.body.general   
  const whatsapp=req.body.whatsapp  
  const date=req.body.date
 /*console.log(pill)
 console.log(head) 
 console.log(general)
 console.log(whatsapp)
 console.log(date)*/
 console.log(req.body.value)
 
  /*try{
    pool.connect(async(error, client)=>{ 
     const response=await pool.query('UPDATE registers SET pills_op = $1 , head_op = $2, general_op = $3 WHERE whatsapp = $4 AND date = $5',[pill,head,general,whatsapp,date])
     console.log(error)
     res.send(response.rows)
   })
 }  
 catch(err){ 
   console.log(err) 
 }*/
  
}
const infoOperador= async(req, res)=>{
  console.log("legaste qui")
  const allClients=[] 
  try{
    pool.connect(async(error, client)=>{ 
     const clientes=await client.query(`SELECT * FROM clients`)
     const registers=await client.query(`SELECT * FROM registers`)
     /*allClients.push(clientes.rows) 
     allClients.push(registers.rows)
     res.send(allClients)*/
     res.json({ 
      clients:clientes.rows,   
      registers:registers.rows      
     })
     }) 
        
     
    }
    catch(err){
      console.log(err) 
    }

}


const newCuidador=async(req, res)=>{
  
  const id_client=req.params.id
  const name=req.body.name
  const lastname=req.body.lastname
  const mail=req.body.mail
  const parentesco=req.body.parentesco
console.log(req.params) 
  try {
    
      await pool.query('INSERT INTO cuidadores(name,lastname,mail,parentesco,id_cliente) VALUES ($1,$2,$3,$4,$5)',[name,lastname,mail,parentesco,id_client])
      res.send("cuidador added succesfully")
    }
    catch(err){  
      console.log(err)
    } 

}



const infoPacienteCuidador= async(req, res)=>{
  const id=req.params.id
  console.log(id)
  
  try{
    pool.connect(async(error, client)=>{
     const cuidadores=await client.query(`SELECT * FROM cuidadores WHERE id_cliente = $1`,[id])
    
    
     res.send(cuidadores.rows)  
   })
 }
 catch(err){
   console.log(err)
 } 
  
}

const infoClientsTotal=async(req, res)=>{
       
  const infoTotal=[]
  try{
    pool.connect(async(error, client)=>{
     const clients=await client.query(`SELECT * FROM clients`)
     for(let i=0; i<clients.rows.length;i++){
     let user={infoUser:clients.rows[i]}
     
     let whatsapp=clients.rows[i].whatsapp
     let idCliente=clients.rows[i].id
    
     const registro=await client.query(`SELECT * FROM registers WHERE whatsapp = $1`,[whatsapp])
     user.registros=registro.rows
     const signosVitales=await client.query(`SELECT * FROM registros_vitales WHERE id_client = $1`,[idCliente])
    

     if(signosVitales.rows.length>0){
      var data=[]
      for(let j = 0; j < signosVitales.rows.length; j++){
        let fecha=signosVitales.rows[j].date.toString()
        let date=fecha.slice(0,15)
        var registroindividual={
        temperatura:Number(signosVitales.rows[j].temperatura),
        presion_arterial:Number(signosVitales.rows[j].presion_arterial),
        frecuencia_respiratoria:Number(signosVitales.rows[j].frecuencia_respiratoria),
        frecuencia_cardiaca:Number(signosVitales.rows[j].frecuencia_cardiaca),
        saturacion_oxigeno:Number(signosVitales.rows[j].saturacion_oxigeno),
        peso:Number(signosVitales.rows[j].peso),
        id:Number(signosVitales.rows[j].id),
        grasa_corporal:Number(signosVitales.rows[j].grasa_corporal),
        perimetro_abdominal:Number(signosVitales.rows[j].perimetro_abdominal),
        reaccion_orina:Number(signosVitales.rows[j].reaccion_orina),
        beg:Number(signosVitales.rows[j].beg),
        reg:Number(signosVitales.rows[j].reg), 
        meg:Number(signosVitales.rows[j].meg), 
        date:date  
      }
      data.push(registroindividual)
      }
      let registrosOrdenados=data.sort((a,b)=>{return a.id-b.id})
      user.signosVitales=registrosOrdenados
     }
     else{
      user.signosVitales=signosVitales.rows
     }
     
     infoTotal.push(user)   
     }

     res.send(infoTotal)
   }) 
   
 }
 catch(err){
   console.log(err)
 }
 


}


const getIndicadores= async(req, res)=>{
  
  try{
    pool.connect(async(error, client)=>{
     const indicadores=await client.query(`SELECT * FROM indicadores`)
     let a=indicadores.rows.sort((a,b)=>{return a.id-b.id})
    
     res.send(a)  
   }) 
 } 
 catch(err){
   console.log(err)  
 }
}

const newIndicador=async(req, res)=>{
  
  const name=req.body.name
  const max=req.body.max 
  const min=req.body.min
  const description=req.body.description
 
  try {
    
      await pool.query('INSERT INTO indicadores(name,max_value,min_value,description) VALUES ($1,$2,$3,$4)',[name,max,min,description])
      res.send("indicador added succesfully")
    }
    catch(err){  
      console.log(err)
    } 

}


const getSintomas= async(req, res)=>{
  try{
    pool.connect(async(error, client)=>{
     const sintomas=await client.query(`SELECT * FROM sintomas`)
    
    
     res.send(sintomas.rows)  
   })
 }
 catch(err){
   console.log(err)
 }
}

const newSintoma=async(req, res)=>{
  
  const name=req.body.name
  const description=req.body.description
 
  try {
    
      await pool.query('INSERT INTO sintomas(name,description) VALUES ($1,$2)',[name,description])
      res.send("sintoma added succesfully")
    }
    catch(err){  
      console.log(err) 
    } 

}

const registrarPacientePlanMonitoreo=async(req, res)=>{
  const idPaciente=req.body.idCliente 
  const enfermedad=req.body.enfermedad
  
  
  try{
    await pool.query('UPDATE clients SET registrado=$1,enfermedad=$2 WHERE id=$3',[true,enfermedad,idPaciente])
    console.log("registrado")
    res.status(200).send("user registered successfully") 
    } 
    catch(err){ 
      console.log(err)
    } 
    
}


const editIndicador= async(req, res)=>{
  const min=req.body.min
  const max=req.body.max
  const idIndicador=req.params.idIndicador
  console.log(idIndicador)
  try{
    await pool.query('UPDATE indicadores SET min_value=$1,max_value=$2 WHERE id=$3',[min,max,idIndicador])
    
    res.status(200).send("indicador actualizado exitosamente")  
    } 
    catch(err){ 
      console.log(err)     
    } 
 
}

const addIndicators=async(req, res)=>{
  for(let i=0; i<req.body.length; i++){
    const {id_client,temperatura,presion_arterial,frecuencia_respiratoria,frecuencia_cardiaca,saturacion_oxigeno,peso,imc,grasa_corporal,perimetro_abdominal,reaccion_orina,beg,reg,meg,estilo_vida,signos,estado_general}=req.body[i]
    console.log(id_client)
    try{
      await pool.query('INSERT INTO registros_vitales(temperatura,presion_arterial,frecuencia_respiratoria,frecuencia_cardiaca,saturacion_oxigeno,peso,imc,grasa_corporal,perimetro_abdominal,reaccion_orina,beg,reg,meg,estilo_vida,signos,id_client,estado_general) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)',[temperatura,presion_arterial,frecuencia_respiratoria,frecuencia_cardiaca,saturacion_oxigeno,peso,imc,grasa_corporal,perimetro_abdominal,reaccion_orina,beg,reg,meg,estilo_vida,signos,id_client,estado_general])
      
      res.status(200).send("datos cargados exitosamente")  
      } 
      catch(err){ 
        console.log(err)      
      } 
  }

}
//SELECT * FROM clients INNER join estado on clients.phone = estado.whatsapp;

const testear=async(req,res)=>{

  var date=new Date()
  var fechaActual=date.getDate().toString()
  var mesActual=date.getMonth().toString()
  var añoActual=date.getFullYear().toString()                

 var fecha=fechaActual+mesActual+añoActual

 try{
  pool.connect(async(error, client)=>{ 
   const values=await client.query(`SELECT * FROM test`)}
   )
  
  }
   catch(error){
    console.log(error)
   }
 
  }


module.exports ={testear, verificarToken,getClients,newClient,getUserById,deleteUserById,updateUserById,loginUser,infoClients,loginAdmin,newNurse,loginNurse,infoNurse,updateInfo,getNurses,getDoctors,newDoctor,loginDoctor,infoDoctor,whatsapp,mail,loginOperador,updateOperadorInfo,infoOperador,newCuidador,infoPacienteCuidador,infoClientsTotal,getIndicadores,newIndicador,getSintomas,newSintoma,registrarPacientePlanMonitoreo,editIndicador,newhatsapp,addIndicators}