const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const port = 5000;

// Middleware
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "public/images")));

const mongoose = require("mongoose");

const uri =
  "mongodb+srv://lnhduygv2711:O5TLpFqfbAvUggy2@cluster0.fquo7e3.mongodb.net/Necklace?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

const necklaceSchema = new mongoose.Schema({
  id: String,
  name: String,
  image: String,
  status: String,
  price: Number,
  description: String,
});

const Necklace = mongoose.model("Necklace", necklaceSchema, "necklaces");

module.exports = Necklace;

app.get("/listNecklace", async (req, res) => {
  try {
    const necklaces = await Necklace.find();
    res.json(necklaces);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

app.post("/addNecklace", async (req, res) => {
  try {
    const { id, name, image, status, price, description } = req.body;

    // Kiểm tra trường bắt buộc
    if (!name || !status || !price || !description) {
      return res.status(400).json({ error: "Thiếu thông tin cần thiết." });
    }

    const newNecklace = new Necklace({
      id: id || Date.now().toString(), // nếu không có thì tự tạo id tạm
      name,
      image: image || "", // có thể không có ảnh
      status,
      price,
      description,
    });

    await newNecklace.save(); // Lưu vào MongoDB

    res
      .status(201)
      .json({ message: "Đã thêm thành công", necklace: newNecklace });
  } catch (error) {
    console.error("Lỗi khi thêm necklace:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

app.use(cookieParser());

const SECRET_KEY = "SECRET_KEY";
const CookieName = "user_token";

app.post("/testLogin", (req, res) => {
  const token = jwt.sign({ user: "guest" }, SECRET_KEY, { expiresIn: "1h" });

  res.cookie(CookieName, token, {
    httpOnly: true,
    secure: false,
    sameSite: "Strict",
  });

  res.json({ message: "Đăng nhập thành công!" });
});

app.get("/verify", (req, res) => {
  const token = req.cookies[CookieName];

  if (!token)
    return res.status(401).json({ message: "Không có quyền truy cập!" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ message: `Truy cập thành công! Xin chào ${decoded.user}` });
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ!" });
  }
});

app.listen(port, () => {
  console.log(`Server đang chạy trên cổng ${port}`);
});
