const jwt = require("jsonwebtoken");

//authmiddleware mainly verify the token is valid or not , then returns the data that was encoded in the token
const authMiddleware = (req, res, next) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ success: false, error: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(400).json({ success: false, error: "Invalid token!!" });
    }
}

module.exports = authMiddleware;