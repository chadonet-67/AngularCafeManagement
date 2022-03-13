const express = require('express')
const con = require('../connection')
const auth = require('../services/authentification')
const checkRole = require('../services/checkRole')
const router = express.Router();

router.post('/add',auth.authentificationToken,checkRole.checkRole, (req, res) => {
    let category = req.body;
    let query = "INSERT INTO category (name) VALUES (?)";
    con.query(query, [category.name], (err, result) => {
             if(!err){
                 return res.status(200).json({message : "Category Add success"})
             }
             else{
                 return res.status(500).json(err)
             }
    })
});

router.get('/get',auth.authentificationToken,(req,res)=>{
   // let category = req.body;
    let query = "SELECT * FROM category ORDER BY name LIMIT 3 ";
    con.query(query,(err,result)=>{
        if(!err){
         return res.status(200).json(result)
        }else
        {
            return res.status(500).json(err)
        }
    })
})

router.patch('/update',auth.authentificationToken,checkRole.checkRole,(req,res)=>{
    let category = req.body;
    let query = "UPDATE category SET name=? WHERE id=?";
    con.query(query,[category.name,category.id],(err,result)=>{
        if(!err){
            if(result.affectedRows ==0)
            {
                return res.status(404).json({message : "category does not exist"})
            }else
            {
                return res.status(200).json({message : "Category Update success"})
            }
        }
        else
        {
            return res.status(500).json(err)
        }
    })
})
module.exports = router