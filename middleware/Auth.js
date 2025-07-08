const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.check_permissions = function (req, res, next) {
    // assuming all route using this middleware is page related
console.log('secret', req.headers)
    if (!req.headers.authorization) {
        return res.status(401).send({ message: "Unauthorized Request" });
    }
    const secret_key = req.headers.authorization;

    

    try {
        const payload = jwt.verify(secret_key, process.env.DEV_ACCESS_SECRET, {
            algorithms: ["HS256", "RS256"],
        });

        console.log('payload', payload)

        if (!payload)
            return res.status(401).send({ message: "Unauthorized Request" });


        next();
    } catch (error) {
        var errorCode = "Something went wrong";

        switch (error.message) {
            case "jwt malformed":
                errorCode = "malformed jwt";
                break;
            case "jwt expired":
                errorCode = "JWT token has expired";
                break;
            default:
                errorCode = "Failed Authentication";
                break;
        }
        return res.status(401).send({ message: errorCode });
    }
};