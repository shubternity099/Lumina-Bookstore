import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

// Seed data if empty
const bookCount = db.prepare('SELECT COUNT(*) as count FROM books').get() as { count: number };
if (bookCount.count === 0) {
  const insert = db.prepare('INSERT INTO books (title, author, price, description, image_url) VALUES (?, ?, ?, ?, ?)');
  const seedBooks = [
    ['The Great Gatsby', 'F. Scott Fitzgerald', 15.99, 'A classic novel about the American Dream.', 'https://picsum.photos/seed/gatsby/400/600'],
    ['1984', 'George Orwell', 12.50, 'A dystopian social science fiction novel.', 'https://picsum.photos/seed/1984/400/600'],
    ['The Hobbit', 'J.R.R. Tolkien', 18.00, "A fantasy novel and children's book.", 'https://picsum.photos/seed/hobbit/400/600'],
    ['To Kill a Mockingbird', 'Harper Lee', 14.95, 'A novel about racial injustice in the American South.', 'https://picsum.photos/seed/mockingbird/400/600'],
    ['Pride and Prejudice', 'Jane Austen', 10.99, 'A romantic novel of manners.', 'https://picsum.photos/seed/pride/400/600'],
    ['The Catcher in the Rye', 'J.D. Salinger', 13.25, 'A story about teenage angst and alienation.', 'https://picsum.photos/seed/catcher/400/600'],
  ];

  for (const book of seedBooks) {
    insert.run(...book);
  }
}

export default db;
