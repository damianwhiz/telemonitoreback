var express = require('express');
var router = express.Router();
const {testear,verificarToken,getClients,newClient,getUserById,deleteUserById,updateUserById,loginUser,infoClients,loginAdmin,newNurse,loginNurse,infoNurse,updateInfo,getNurses,getDoctors,newDoctor,loginDoctor,infoDoctor,whatsapp,mail,loginOperador,updateOperadorInfo,infoOperador,newCuidador,infoPacienteCuidador,infoClientsTotal,getIndicadores,newIndicador,getSintomas,newSintoma,registrarPacientePlanMonitoreo,editIndicador,newhatsapp,addIndicators} =require('../controladores')

router.get("/test",testear)  


//CLIENTS
router.get("/all",getClients)
router.post("/register",newClient)
router.get("/all/:id",verificarToken,getUserById)
router.delete("/all/:id",verificarToken,deleteUserById)
router.put("/all/:id",updateUserById)
router.post("/login",loginUser)
router.get("/info-clients/:id",infoClients)
router.get("/info-clients-total",infoClientsTotal)
router.post("/add-indicadors",addIndicators)
//NURSES
router.post("/login-nurse",loginNurse)
router.post("/register-nurse",newNurse)    
router.get("/nurses",getNurses) 
router.get("/info-nurse/:id",infoNurse)   
router.post("/update-info/:idCliente",updateInfo)   

//DOCTORS
router.get("/doctors",getDoctors) 
router.post("/register-doctor",newDoctor)
router.post("/login-doctor",loginDoctor)
router.get("/info-doctor/:id",infoDoctor)  

//OTHERS    
router.post("/whatsapp",newhatsapp)         

//CUIDADORES
router.post("/new-cuidador/:id",newCuidador) 
router.get("/info-paciente-cuidador/:id",infoPacienteCuidador)

//MAIL 
router.post("/mail",mail)
//ADMIN  
router.post("/login-admin",loginAdmin)
router.post("/login-operator",loginOperador)
router.post("/update-operator",updateOperadorInfo) 
router.get("/info-operator",infoOperador)   

//GET SINTOMAS E INDICADORES
router.put("/registraraplan",registrarPacientePlanMonitoreo)
router.get("/getindicadores",getIndicadores) 
router.post("/addindicador",newIndicador)  
router.put("/editindicador/:idIndicador",editIndicador)
router.get("/getsintomas",getSintomas)
router.post("/addsintoma",newSintoma)   
module.exports=router          