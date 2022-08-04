const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'telemonitoreo',
  password: '1234',
  port: 5432,
})




const getUsers=async(req,res)=>{
    try{
       pool.connect(async(error, client, release)=>{
        const response=await client.query("SELECT * FROM users")
        res.send(response.rows)
      })
    }
    catch(err){
      console.log(err)
    }
    
}
const newUser=async(req, res)=>{
  const name=req.body.name
  const id=req.body.id

  const response=await pool.query('INSERT INTO users(id,name) VALUES ($1,$2)',[id,name])
  res.send("user created successfully")
}
const getUserById = async(req, res)=>{
  const id=req.params.id
  const response=await pool.query('SELECT * FROM users WHERE id=$1',[id])
  res.send(response.rows)
}
const deleteUserById = async(req, res)=>{
  const id=req.params.id
  const response=await pool.query('DELETE FROM users WHERE id=$1',[id])
  res.send("usuario eliminado exitosamente")
}
const updateUserById = async(req, res)=>{
  const id=req.params.id
  const name=req.body.name
  const response=await pool.query('UPDATE users SET name=$1 WHERE id=$2',[name,id])
  res.send("usuario actualizado exitosamente")
}
module.exports ={ getUsers,newUser,getUserById,deleteUserById,updateUserById}