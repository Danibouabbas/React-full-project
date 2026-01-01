const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(
  cors({
    origin: ["https://danibouabbas.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

/* ================= UPLOADS FOLDER ================= */
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

app.use("/uploads", express.static(uploadPath));

/* ================= DATABASE (POOL) ================= */
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

// Test DB connection once
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Database connected");
    connection.release();
  }
});

/* ================= ROUTES ================= */

// Get all menu items
app.get("/api/menu", (req, res) => {
  db.query("SELECT * FROM menu_items", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get single item
app.get("/api/menu/:id", (req, res) => {
  db.query(
    "SELECT * FROM menu_items WHERE id = ?",
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!results.length)
        return res.status(404).json({ message: "Item not found" });
      res.json(results[0]);
    }
  );
});

// Add item
const upload = multer({ dest: uploadPath });

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
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        message: "Item added successfully",
        id: result.insertId,
      });
    }
  );
});

// Delete item
app.delete("/api/menu/:id", (req, res) => {
  db.query("DELETE FROM menu_items WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Item deleted" });
  });
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
