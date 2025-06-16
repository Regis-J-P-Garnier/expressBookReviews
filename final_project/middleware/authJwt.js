const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.session?.authorization?.accessToken;

    if (!token) {
        return res.status(403).json({ message: "User not logged in" });
    }

    try {
        const decoded = jwt.verify(token, "access");
        req.user = decoded.data;
        next();
    } catch (err) {
        return res.status(403).json({ message: "User not authenticated" });
    }
};

module.exports = verifyToken;