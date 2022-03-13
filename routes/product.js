const express = require('express')
const auth = require('../services/authentification')
const checkRole = require('../services/checkRole')
const con = require('../connection')
const router = express.Router()


router.post('/add', auth.authentificationToken, checkRole.checkRole, (req, res) => {
    let product = req.body;
    var query = "INSERT INTO product (name,categoryId,description,price,status) VALUES (?,?,?,?,'true')";
    con.query(query, [product.name, product.categoryId, product.description, product.price], (err, result) => {
        if (!err) {
            return res.status(200).json({ message: "Product add with success !" })
        } else {
            return res.status(500).json(err)
        }
    })
})

router.post('/get', auth.authentificationToken, (req, res, next) => {
    var query = "SELECT p.id,p.name,p.description,p.price,p.status,c.id AS categoryId, c.name AS categoryName  FROM product AS p INNER JOIN category AS c WHERE p.categoryId = c.id";

    con.query(query, (err, result) => {
        if (!err) {
            return res.status(200).json(result)
        } else {
            return res.status(500).json(err)
        }
    })
})


router.get('getCategory/:id', auth.authentificationToken, (req, res) => {
    var id = req.params.id;
    var query = "SELECT id,name FROM product WHERE categoryId=? AND status='true' ";

    con.query(query, [id], (err, result) => {
        if (!err) {
            return res.status(200).json(result)
        } else {
            return res.status(500).json(err)
        }
    })
})

router.get('/getById/:id', auth.authentificationToken, (req, res) => {
    let id = req.params.id
    let query = "SELECT id, name, description,price FROM product WHERE id=?";

    con.query(query, [id], (err, result) => {
        if (!err) {
            return res.status(200).json(result[0])
        } else {
            return res.status(500).json(err)
        }
    })
})

router.patch('/update', auth.authentificationToken, checkRole.checkRole, (req, res) => {
    let product = req.body;
    let query = "UPDATE product SET name =? ,description=? , price =?, categoryId=? WHERE id=? ";
    con.query(query, [product.name, product.description, product.price, product.categoryId,product.id], (err, result) => {
        if (!err) {
            if (result.affectedRows == 0) {
                return res.status(404).json({ message: "Product does not exist" })
            }
            return res.status(200).json({ message: "Product update with success" })
        } else {
            return res.status(500).json(err)
        }
    })
})


router.delete('/delete/:id', auth.authentificationToken, checkRole.checkRole, (req, res, next) => {
    let id = req.params.id;
    let query = "DELETE FROM product WHERE id=?";
    con.query(query, [id], (err, result) => {
        if (!err) {
            if (result.affectedRows == 0) {
                return res.status(404).json({ message: "Product does not exist" })
            }
            return res.status(200).json({ message: "Product delete with sucess" })
        } else {
            return res.status(500).json(err)
        }
    })
})

router.patch('/updateStatus', auth.authentificationToken, checkRole.checkRole, (req, res) => {
    let user = req.body;
    let query = "UPDATE product SET status=? WHERE id=?";
    con.query(query, [user.status,user.id], (err, result) => {
        if (!err) {
            if (result.affectedRows == 0) {
                return res.status(404).json({ message: "Product does exist" })
            }
            return res.status(200).json({ message: "Status update with success" })
        } else {
            return res.status(500).json(err)
        }
    })
})







module.exports = router