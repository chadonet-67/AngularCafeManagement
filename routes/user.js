const { query } = require('express');
const express = require('express');
const con = require('../connection')
const router = express.Router();
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const authentification = require('../services/authentification')
const checkRole = require('../services/checkRole')
require('dotenv').config()

router.post('/signup', (req, res) => {
    let user = req.body;

    let query = "SELECT email,password,status,role FROM user WHERE email=?";
    con.query(query, [user.email], (err, result) => {
        if (!err) {
            if (result.length <= 0) {
                query = "INSERT INTO user (name,contactNumber,email,password,status,role) VALUES (?,?,?,?,'false','user')";
                con.query(query, [user.name, user.contactNumber, user.email, user.password, user.status, user.role], (err, result) => {
                    if (!err) {
                        return res.status(200).json({ message: "User add success !!!" })
                    } else {
                        return res.status(500).json(err)
                    }
                })
            } else {
                return res.status(400).json({ message: "Email alrealy exist" })
            }
        } else {
            return res.status(500).json(err)
        }
    })


});

router.post('/login', (req, res) => {
    let user = req.body;
    let query = "SELECT email,password,status,role FROM user WHERE  email=?";
    con.query(query, [user.email], (err, result) => {
        if (!err) {
            if (result.length <= 0 || result[0].password != user.password) {
                return res.status(400).json({ message: 'Incorrect Username or Password' });
            } else if (result[0].status === 'false') {
                return res.status(401).json({ message: 'wait Admin approval' });
            } else if (result[0].password == user.password) {
                const response = { email: result[0].email, role: result[0].role };
                const secretToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' });
                res.status(200).json({ token: secretToken })
            } else {
                return
            }
        } else {
            return res.status(500).json(err);
        }
    })
})

var transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

router.post('/forgotPassword', (req, res) => {
    let user = req.body;
    let query = "SELECT email,password FROM user WHERE email=?";
    con.query(query, [user.email], (err, result) => {
        if (!err) {
            if (result.length <= 0) {
                return res.status(200).json({ message: "Password sent success your email" })
            } else {
                var mailOptions = {
                    from: process.env.EMAIL,
                    to: result[0].email,
                    subject: 'Password by Cafe Management',
                    html: '<p><b>Your login details by cafe Management system</b><br><b>Email :</b>' + result[0].email + '<br><b>Password: </b>' + result[0].password + '<br><a href="http://localhost:4200/">Click here</a></p>'
                };

                transport.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("Email sent : " + info.response)
                    }
                });
                return res.status(200).json({ message: "Password sent success your email" })
            }
        } else {
            return res.status(500).json(err)
        }
    })
})

router.get('/get', authentification.authentificationToken,checkRole.checkRole, (req, res) => {
    let query = "SELECT id,name,contactNumber,email,status FROM user WHERE role='user' ";
    con.query(query, (err, result) => {
        if (!err) {
            return res.status(200).json(result)

        } else {
            return res.status(500).json(err)
        }
    })
})

router.patch('/update', authentification.authentificationToken,checkRole.checkRole, (req, res) => {
    let user = req.body;
    let query = "UPDATE user SET status=? WHERE id=?";
    con.query(query, [user.status, user.id], (err, result) => {
        if (!err) {
            if (result.affectedRows == 0) {
                return res.status(404).json({ message: "User does not exist" })
            }
            return res.status(200).json({ message: "User update with success" })
        } else {
            return res.status(500).json(err)
        }
    })
})

router.get('/checkToken', authentification.authentificationToken, (req, res) => {
    return res.status(200).json({ message: 'true' })
})

router.post('/changePassword',authentification.authentificationToken, (req, res) => {
    let user = req.body;
    let email = res.locals.email;
    console.log(email);
    var query = "SELECT * FROM user WHERE email=? AND password=?";
    con.query(query, [email, user.oldPassword], (err, result) => {
        if (!err) {
            if (result.length <= 0) {
                return res.status(400).json({ message: "Incorrect old password" })
            } else if (result[0].password == user.oldPassword) {

                var query = "UPDATE user SET password =? WHERE email=?";
                con.query(query,[user.newPassword,email], (err, result) => {
                    if (!err) {
                        return res.status(200).json({ message: "Password Update with success !" })
                    } else {
                        return res.status(500).json(err)
                    }
                })
            } else {
                return res.status(400).json({ message: "Une erreur est survenue. Try again please" })
            }
        } else {
            return res.status(500).json(err)
        }
    })
})
module.exports = router;