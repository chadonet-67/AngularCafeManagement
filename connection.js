require('dotenv').config()

const mysql = require('mysql')

var connection = mysql.createConnection({
    port : process.env.DB_PORT,
    host : process.env.DB_HOST,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
    user: process.env.DB_USERNAME
});
connection.connect((err)=>{
    if(!err){
        console.log('connected')
    }else{
        console.log(err)
    }
});

module.exports = connection;