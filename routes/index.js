var express = require('express');
var router = express.Router();
const {getUsers,newUser,getUserById,deleteUserById,updateUserById} =require('../controladores')


router.get("/all",getUsers)
router.post("/new",newUser)
router.get("/all/:id",getUserById)
router.delete("/all/:id",deleteUserById)
router.put("/all/:id",updateUserById)
module.exports=router