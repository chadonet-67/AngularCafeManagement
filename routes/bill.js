const express = require('express');
const con = require('../connection');
const router = express.Router();
let pdf = require('html-pdf');
let path = require('path');
let ejs = require('ejs');
var fs = require('fs');
var uuid = require('uuid');
var auth = require('../services/authentification');
var checkRole = require('../services/checkRole');

router.post('/generateReport', auth.authentificationToken, (req, res) => {
    const generatedUuid = uuid.v1();
    const orderDetails = req.body;
    var productDetailsReport = JSON.parse(orderDetails.productDetails);
    var query = "INSERT INTO bill (name,uuid,email,contactNumber,payementMethod,total,productDetails,createdBy) VALUES (?,?,?,?,?,?,?,?)";
    con.query(query, [orderDetails.name, generatedUuid, orderDetails.email, orderDetails.contactNumber, orderDetails.payementMethod, orderDetails.totalAmount, orderDetails.productDetails, res.locals.email], (err, result) => {
        if (!err) {
            ejs.renderFile(path.join(__dirname,'', "./report.ejs"), { productDetails: productDetailsReport, name: orderDetails.name, email: orderDetails.email, contactNumber: orderDetails.contactNumber, payementMethod: orderDetails.payementMethod, totalAmount: orderDetails.totalAmount }, (err, result) => {
                if (err) {
                    return res.status(500).json(err)
                }
                else {
                    pdf.create(result).toFile('./generate_pdf/' + generatedUuid + ".pdf", function (err, data) {
                        if (err) {
                            console.log(err)
                            return res.status(500).json(err)
                        } else {
                            return res.status(200).json({ uuid: generatedUuid })
                        }
                    })
                }
            })
        } else {
            return res.status(500).json(err)
        }
    })
})

router.get('/getPdf', auth.authentificationToken, function (req, res) {
    var orderDetails = req.body;
    var pdfPath = './generate_pdf/' + orderDetails.uuid + '.pdf';
    if (fs.existsSync(pdfPath)) {
        res.contentType('application/pdf')
        fs.createReadStream(pdfPath).pipe(res)
    } else {
        var productDetailsReport = JSON.parse(orderDetails.productDetails);
        ejs.renderFile(path.join(__dirname,'', "./report.ejs"), { productDetails: productDetailsReport, name: orderDetails.name, email: orderDetails.email, contactNumber: orderDetails.contactNumber, payementMethod: orderDetails.payementMethod, totalAmount: orderDetails.totalAmount }, (err, result) => {
            if (err) {
                return res.status(500).json(err)
            }
            else {
                pdf.create(result).toFile('./generate_pdf/' + orderDetails.uuid + ".pdf", function (err, data) {
                    if (err) {
                        console.log(err)
                        return res.status(500).json(err)
                    } else {
                        res.contentType('application/pdf')
                        fs.createReadStream(pdfPath).pipe(res)
                    }
                })
            }
        })

    }
})

router.get('/getBills',auth.authentificationToken,function(req,res){
    var query ="SELECT * FROM bill ORDER BY id"
    con.query(query,(err,result)=>{
        if(!err)
        {
            return res.status(200).json(result)
        }else
        {
            return res.status(500).json(err)
        }
    })
})
router.delete('/delete/:id',auth.authentificationToken,(req,res,next)=>{
    let id = req.params.id;
    var query = "DELETE FROM bill WHERE id=?";
    con.query(query,[id],(err,result)=>{
        if(!err)
        {
            if(result.affectedRows ==0){
                return res.status(404).json({message : "Bill does not exist"})
            }
            return res.status(200).json({message : "Bill delete with success"})
        }else{
            return res.status(500).json(err)
        }
    })
})
module.exports = router