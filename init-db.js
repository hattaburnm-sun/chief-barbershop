const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    // 1. Products Table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        subtitle TEXT,
        price INTEGER,
        old_price INTEGER,
        image_url TEXT,
        badge TEXT,
        badge_color TEXT,
        is_featured BOOLEAN DEFAULT 0
    )`);

    // 2. Articles Table (The Chief Journal)
    db.run(`CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        image_url TEXT,
        pos_class TEXT
    )`);

    // 3. Bookings Table
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location TEXT,
        service TEXT,
        booking_date TEXT,
        booking_time TEXT,
        customer_name TEXT,
        customer_phone TEXT,
        customer_email TEXT,
        status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 4. Banners Table
    db.run(`CREATE TABLE IF NOT EXISTS banners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        subtitle TEXT,
        price_text TEXT,
        image_url TEXT,
        badge_text TEXT,
        bg_class TEXT
    )`);

    // Seed Initial Products
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (row.count === 0) {
            const stmt = db.prepare("INSERT INTO products (name, subtitle, price, old_price, image_url, badge, badge_color, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            stmt.run("Chief Solid Black Pomade", "Waterbased", 130000, null, "pomade_jar_1781250411744.png", "BESTSELLER", "orange", 1);
            stmt.run("Pro Silver Clipper", "Cordless", 850000, 999000, "product_clipper_1781352829774.png", "NEW", "blue", 1);
            stmt.run("Beard Oil Premium", "Nourishing", 150000, null, "placeholder", "SALE", "blue", 1);
            stmt.finalize();
            console.log("Seeded initial products.");
        }
    });

    // Seed Initial Articles
    db.get("SELECT COUNT(*) as count FROM articles", (err, row) => {
        if (row.count === 0) {
            const stmt = db.prepare("INSERT INTO articles (title, image_url, pos_class) VALUES (?, ?, ?)");
            stmt.run("Article 1", "cover artikel/1.png", "pos-1");
            stmt.run("Article 2", "cover artikel/2.png", "pos-2");
            stmt.run("Article 3", "cover artikel/3.png", "pos-3");
            stmt.run("Article 4", "cover artikel/4.png", "pos-4");
            stmt.run("Article 5", "cover artikel/5.png", "pos-5");
            stmt.finalize();
            console.log("Seeded initial articles.");
        }
    });

    // Seed Initial Banners
    db.get("SELECT COUNT(*) as count FROM banners", (err, row) => {
        if (row.count === 0) {
            const stmt = db.prepare("INSERT INTO banners (title, subtitle, price_text, image_url, badge_text, bg_class) VALUES (?, ?, ?, ?, ?, ?)");
            // Banner 1: Signature Bundle
            stmt.run("Signature Bundle", "ELEVATE YOUR GROOMING ROUTINE", "Starting at<br><strong>Rp 250.000</strong>", "Asset Banner/pomade_jar_1781250411744.png", "", "bg-gradient");
            // Banner 2: Shop All
            stmt.run("Save up to 35%", "on Weekly Discounts", "", "", "SHOP ALL", "bg-blue");
            stmt.finalize();
            console.log("Seeded initial banners.");
        }
    });
});

db.close(() => {
    console.log("Database initialization complete.");
});
