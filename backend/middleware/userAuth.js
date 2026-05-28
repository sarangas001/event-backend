const jwt = require('jsonwebtoken')



const userAuth = async (req, res, next) => {
    try {
        
        //Get the token from cookies
        const {token} = req.cookies;
        
        //Check the login or not
        if(!token) {
            return res.json({success: false, message: "Not Authorized. Login Again!"})
        }

        //Get token decode
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        
        //Check the token is valid or  not
        if(tokenDecode?.id) {
            
            if(req.body) {
                req.body.userId = tokenDecode.id
            }else{
                req.body = {userId: tokenDecode.id}
            }

            next();
        }else {
            return res.send({success: false, message: "Not Authorized. Login Again!"})
        }

    } catch (error) {
        //Send error message when it is cause error
        return res.send({success: false, message: error})
    }
}

module.exports = userAuth;