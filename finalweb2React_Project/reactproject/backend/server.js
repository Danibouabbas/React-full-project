
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

/* ================= Upload Folder ================= */
const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

app.use("/uploads", express.static(uploadPath));

/* ================= Database Connection ================= */
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL Connection Error:", err.message);
  } else {
    console.log("✅ Connected to MySQL Database");
    connection.release();
  }
});

/* ================= Multer Setup ================= */
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

/* ================= ROUTES ================= */

// ✅ Get all menu items
app.get("/api/menu", (req, res) => {
  db.query("SELECT * FROM menu_items", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});


app.post("/api/menu", upload.single("image"), (req, res) => {
  const { name, description, price, category } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Image is required" });
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
        message: "Item added successfully",
        id: result.insertId,
      });
    }
  );
});


app.delete("/api/menu/:id", (req, res) => {
  db.query("DELETE FROM menu_items WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Item deleted successfully" });
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
