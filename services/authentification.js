require('dotenv').config();
const jwt = require('jsonwebtoken');


function authentificationToken(req, res, next) {
    const authHeaders = req.headers['authorization'];
    const token = authHeaders && authHeaders.split(' ')[1]

    if (token == null)
        return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, response) => {
        if (err)
            return res.sendStatus(403);
        res.locals = response;
        next()
    })
}

module.exports = { authentificationToken: authentificationToken }