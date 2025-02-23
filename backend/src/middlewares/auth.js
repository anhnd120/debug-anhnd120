const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("❌ Token bị thiếu hoặc không hợp lệ:", authHeader);
    return res.status(401).json({ message: "Unauthorized, token missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("✅ User từ token:", req.user);
    next();
  } catch (error) {
    console.error("❌ Token không hợp lệ:", error.message);
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
