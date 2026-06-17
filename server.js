const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

// Connect to SQLite DB
const db = new sqlite3.Database('./database.sqlite');

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'Asset Banner/') // store uploaded images here for simplicity
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static HTML/CSS/JS files

// --- PRODUCTS API ---

// Get all products
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add a product
app.post('/api/products', upload.single('image'), (req, res) => {
    const { name, subtitle, price, old_price, badge, badge_color, is_featured } = req.body;
    let image_url = req.body.image_url; 
    if (req.file) {
        image_url = 'Asset Banner/' + req.file.filename;
    }
    
    const stmt = db.prepare("INSERT INTO products (name, subtitle, price, old_price, image_url, badge, badge_color, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    stmt.run([name, subtitle, price, old_price || null, image_url, badge, badge_color, is_featured || 0], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: "Product added successfully!" });
    });
});

// Update a product
app.put('/api/products/:id', upload.single('image'), (req, res) => {
    const id = req.params.id;
    const { name, subtitle, price, old_price, badge, badge_color, is_featured } = req.body;
    
    if (req.file) {
        const image_url = 'Asset Banner/' + req.file.filename;
        db.run("UPDATE products SET name=?, subtitle=?, price=?, old_price=?, image_url=?, badge=?, badge_color=?, is_featured=? WHERE id=?",
            [name, subtitle, price, old_price || null, image_url, badge, badge_color, is_featured || 0, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Product updated successfully!" });
        });
    } else {
        db.run("UPDATE products SET name=?, subtitle=?, price=?, old_price=?, badge=?, badge_color=?, is_featured=? WHERE id=?",
            [name, subtitle, price, old_price || null, badge, badge_color, is_featured || 0, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Product updated successfully!" });
        });
    }
});

// Delete a product
app.delete('/api/products/:id', (req, res) => {
    db.run("DELETE FROM products WHERE id=?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Product deleted successfully!" });
    });
});

// --- ARTICLES API ---

app.get('/api/articles', (req, res) => {
    db.all("SELECT * FROM articles", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/articles', upload.single('image'), (req, res) => {
    const { title, pos_class } = req.body;
    let image_url = req.body.image_url; 
    if (req.file) {
        image_url = 'cover artikel/' + req.file.filename; // using cover artikel logic
    }
    
    db.run("INSERT INTO articles (title, image_url, pos_class) VALUES (?, ?, ?)", [title, image_url, pos_class], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: "Article added successfully!" });
    });
});

app.delete('/api/articles/:id', (req, res) => {
    db.run("DELETE FROM articles WHERE id=?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Article deleted successfully!" });
    });
});

// --- BOOKINGS API ---

app.post('/api/bookings', (req, res) => {
    const { location, service, date, time, name, phone, email } = req.body;
    db.run("INSERT INTO bookings (location, service, booking_date, booking_time, customer_name, customer_phone, customer_email) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [location, service, date, time, name, phone, email], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: "Booking received successfully!" });
    });
});

app.get('/api/bookings', (req, res) => {
    db.all("SELECT * FROM bookings ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.put('/api/bookings/:id/status', (req, res) => {
    const { status } = req.body;
    db.run("UPDATE bookings SET status=? WHERE id=?", [status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Booking status updated!" });
    });
});

// --- BANNERS API ---

app.get('/api/banners', (req, res) => {
    db.all("SELECT * FROM banners", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.put('/api/banners/:id', upload.single('image'), (req, res) => {
    const id = req.params.id;
    const { title, subtitle, price_text, badge_text, bg_class } = req.body;
    
    if (req.file) {
        const image_url = 'Asset Banner/' + req.file.filename;
        db.run("UPDATE banners SET title=?, subtitle=?, price_text=?, image_url=?, badge_text=?, bg_class=? WHERE id=?",
            [title, subtitle, price_text, image_url, badge_text, bg_class, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Banner updated successfully!" });
        });
    } else {
        db.run("UPDATE banners SET title=?, subtitle=?, price_text=?, badge_text=?, bg_class=? WHERE id=?",
            [title, subtitle, price_text, badge_text, bg_class, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Banner updated successfully!" });
        });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Backend Server running at http://localhost:${port}`);
    console.log(`Open http://localhost:${port}/admin.html to view the dashboard`);
});
