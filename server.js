const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

const app = express();
const port = 5000;
dotenv.config();

// Middleware
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
