const jwt = require('jsonwebtoken');

exports.requesterUser = function(req){
        
    const token = req.headers.authorization.split(' ')[1];
    return jwt.decode(token).user;
}