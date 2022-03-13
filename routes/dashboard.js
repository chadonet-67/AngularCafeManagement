const express = require('express')
const router = express.Router()
const con = require('../connection')
var auth = require('../services/authentification')

router.get('/details', auth.authentificationToken, (req, res, next) => {
    var categoryCount;
    var productCount;
    var billCount;
    var query = "SELECT COUNT(id) AS categoryCount FROM category"
    con.query(query, (err, result) => {
        if (!err) {
            categoryCount = result[0].categoryCount;
        } else {
            return res.status(500).json(err)
        }
    })

    var query1 = "SELECT COUNT(id) AS productCount FROM product";
    con.query(query1, (err, result) => {
        if (!err) {
            productCount = result[0].productCount
        }
        else {
            return res.status(500).json(err)
        }
    })
    var query2 = "SELECT COUNT(id) AS billCount FROM bill";
    con.query(query2, (err, result) => {
        if (!err) {
            billCount = result[0].billCount;
            var data ={
                category : categoryCount,
                product : productCount,
                bill : billCount
            }
            return res.status(200).json(data)
        }
        else {
            return res.status(500).json(err)
        }
    })
})

module.exports = router