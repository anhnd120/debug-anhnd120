const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Đăng ký tài khoản
exports.register = async (req, res) => {
  try {
    const { username, password, role, name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Tên không được để trống" });
    }

    const user = new User({ username, password, role, name });
    await user.save();
    
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name }, // ✅ Thêm `name` vào token
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    res.json({ token, role: user.role, name: user.name }); // ✅ Trả về `name`
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
