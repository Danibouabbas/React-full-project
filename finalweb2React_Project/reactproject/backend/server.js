const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();

/* ================= Middleware ================= */
app.use(cors());
app.use(express.json());

/* ================= Uploads Folder ================= */
const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

app.use("/uploads", express.static(uploadPath));

/* ================= Database ================= */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "restaurant_db",
  port: 4306,
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL error:", err.message);
    return;
  }
  console.log("✅ MySQL connected");
});

/* ================= Multer ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* ================= Routes ================= */

// Get all menu items
app.get("/api/menu", (req, res) => {
  db.query("SELECT * FROM menu_items", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// Add menu item (with image)
app.post("/api/menu", upload.single("image"), (req, res) => {
  const { name, description, price, category } = req.body;

  if (!req.file) {
    return res
      .status(400)
      .json({ message: "Please select an image from your device" });
  }

  const image_url = `/uploads/${req.file.filename}`;

  const sql =
    "INSERT INTO menu_items (name, description, image_url, price, category) VALUES (?, ?, ?, ?, ?)";

  db.query(
    sql,
    [name, description, image_url, price, category],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({
        message: "Item added successfully!",
        id: result.insertId,
      });
    }
  );
});

// Delete menu item
app.delete("/api/menu/:id", (req, res) => {
  db.query(
    "DELETE FROM menu_items WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Item deleted" });
    }
  );
});

/* ================= Server ================= */
app.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});
