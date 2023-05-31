const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const token = req.headers['x-api-key'];
        if(!token) {
            return res.status(401).json({
                status: false,
                message: 'No token provided'
            })
        }

        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if(err) {
                return res.status(403).json({
                    status: false,
                    message: 'Invalid token'
                })
            }
            req.authorId = decoded.authorId;
            next();
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

module.exports = { auth }