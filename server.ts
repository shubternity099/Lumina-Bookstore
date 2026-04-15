import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "./src/lib/db.ts";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-lumina-books";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API Routes ---

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Access denied" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
      stmt.run(name, email, hashedPassword);
      res.status(201).json({ message: "User registered successfully" });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        res.status(400).json({ message: "Email already exists" });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    res.json({ user: req.user });
  });

  // Book Routes
  app.get("/api/books", (req, res) => {
    const books = db.prepare('SELECT * FROM books').all();
    res.json(books);
  });

  app.get("/api/books/:id", (req, res) => {
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  });

  app.post("/api/books", authenticateToken, (req, res) => {
    const { title, author, price, description, image_url } = req.body;
    const stmt = db.prepare('INSERT INTO books (title, author, price, description, image_url) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(title, author, price, description, image_url);
    res.status(201).json({ id: info.lastInsertRowid, title, author, price, description, image_url });
  });

  app.put("/api/books/:id", authenticateToken, (req, res) => {
    const { title, author, price, description, image_url } = req.body;
    const stmt = db.prepare('UPDATE books SET title = ?, author = ?, price = ?, description = ?, image_url = ? WHERE id = ?');
    const info = stmt.run(title, author, price, description, image_url, req.params.id);
    if (info.changes === 0) return res.status(404).json({ message: "Book not found" });
    res.json({ id: req.params.id, title, author, price, description, image_url });
  });

  app.delete("/api/books/:id", authenticateToken, (req, res) => {
    const stmt = db.prepare('DELETE FROM books WHERE id = ?');
    const info = stmt.run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Book deleted successfully" });
  });

  // Review Routes
  app.get("/api/books/:id/reviews", (req, res) => {
    const reviews = db.prepare('SELECT * FROM reviews WHERE book_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json(reviews);
  });

  app.post("/api/books/:id/reviews", authenticateToken, (req: any, res) => {
    const { rating, comment } = req.body;
    const bookId = req.params.id;
    const userId = req.user.id;
    const userName = req.user.name;

    try {
      const stmt = db.prepare('INSERT INTO reviews (book_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)');
      const info = stmt.run(bookId, userId, userName, rating, comment);
      res.status(201).json({ id: info.lastInsertRowid, book_id: bookId, user_id: userId, user_name: userName, rating, comment });
    } catch (error) {
      res.status(500).json({ message: "Failed to add review" });
    }
  });

  // --- Vite / Static Files ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
