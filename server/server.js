const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const port = 3000;

const passwords = ['Akanksha1', 'Akanksha2'];

passwords.forEach(async (password) => {
  const hash = await bcrypt.hash(password, 10);
  console.log(`Password: ${password}, Hash: ${hash}`);
});

// Debugging logs to check environment variables
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// MySQL database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Route to serve the front page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'front.html')); // Adjusted path
});

// Route to serve the User Login page
app.get('/user-login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'user-login.html')); // Adjusted path
});

// Route to serve the Admin Login page
app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'admin-login.html')); // Adjusted path
});

// Login routes
app.post('/login/user', (req, res) => {
  const { username, password } = req.body;

  console.log('Login attempt:', { username, password });

  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
    if (results.length === 0) {
      console.log('No user found with username:', username);
      return res.status(401).json({ success: false, message: 'User not found. Please register first.' });
    }

    const user = results[0];
    console.log('User fetched from DB:', user);

    const match = await bcrypt.compare(password, user.password);
    console.log('Password match result:', match);

    if (match) {
      return res.json({ success: true, redirect: '/dashboard-user' });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please try again.' });
    }
  });
});

app.post('/login/admin', (req, res) => {
  const { username, password } = req.body;

  console.log('Admin login attempt:', { username, password });

  const query = 'SELECT * FROM admins WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
    if (results.length === 0) {
      console.log('No admin found with username:', username);
      return res.status(401).json({ success: false, message: 'Admin not found.' });
    }

    const admin = results[0];
    console.log('Admin fetched from DB:', admin);

    const match = await bcrypt.compare(password, admin.password);
    console.log('Password match result:', match);

    if (match) {
      return res.json({ success: true, redirect: '/dashboard-admin' });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please try again.' });
    }
  });
});

// Route to serve the User Dashboard page
app.get('/dashboard-user', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'dashboard-user.html')); // Adjusted path
});

// Route to serve the Admin Dashboard page
app.get('/dashboard-admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'dashboard-admin.html')); // Adjusted path
});

// Cart functionality
const books = [
  { id: 1, title: 'Clean Code', author: 'Robert C. Martin', price: 29.99, image: '/IMG/page.jpg', description: 'A guide to writing clean and maintainable code.' },
  { id: 2, title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas', price: 35.99, image: '/IMG/page.jpg', description: 'A guide for practical and effective software development.' },
  { id: 3, title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', price: 19.99, image: '/IMG/page.jpg', description: 'A guide to the best features of JavaScript.' },
  { id: 4, title: 'How Innovation Works', author: 'Matt Ridley', price: 29.25, image: '/IMG/page.jpg', description: 'A guide to writing clean and maintainable code.' },
  { id: 5, title: 'Hooked', author: 'Eyal Nir', price: 30.99, image: '/IMG/page.jpg', description: 'A guide for practical and effective software development.' },
  { id: 6, title: 'The Titanium Economy', author: 'Asutosh Padhi', price: 49.99, image: '/IMG/page.jpg', description: 'A guide to the best features of JavaScript.' },
  { id: 7, title: 'The Soul of a New Machine', author: 'Tracy Kidder', price: 25.99, image: '/IMG/page.jpg', description: 'A guide to writing clean and maintainable code.' },
  { id: 8, title: 'The perfectionists', author: 'Simon Winchester', price: 31.99, image: '/IMG/page.jpg', description: 'A guide for practical and effective software development.' },
  { id: 9, title: 'The Code', author: 'Margaret OMara', price: 38.07, image: '/IMG/page.jpg', description: 'A guide to the best features of JavaScript.' },
];

let cart = []; // In-memory cart

app.get('/books', (req, res) => {
  console.log('Fetching books...');
  const query = 'SELECT * FROM books';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching books:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch books' });
    }
    //console.log('Books fetched:', results);
    res.json(results);
  });
});


// Add book to cart
app.post('/cart/add/:id', (req, res) => {
  const bookId = parseInt(req.params.id, 10);
  const query = 'SELECT * FROM books WHERE id = ?';
  db.query(query, [bookId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error adding book to cart' });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found!' });
    }

    const book = results[0];
    if (cart.find((item) => item.id === bookId)) {
      return res.json({ success: false, message: 'Book already in cart!' });
    }

    cart.push(book);
    res.json({ success: true, message: 'Book added to cart!' });
  });
});

// Remove book from cart
app.delete('/cart/remove/:id', (req, res) => {
  const bookId = parseInt(req.params.id, 10);
  const bookIndex = cart.findIndex((item) => item.id === bookId);

  if (bookIndex === -1) {
    return res.status(404).json({ success: false, message: 'Book not found in cart!' });
  }

  cart.splice(bookIndex, 1);
  res.json({ success: true, message: 'Book removed from cart!' });
});

// Get all cart items
app.get('/cart', (req, res) => {
  res.json(cart);
});



app.delete('/books/delete/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM books WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting book:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete book' });
    }
    res.json({ success: true });
  });
});

app.post('/books/add', (req, res) => {
  const { title, author, description, price, image } = req.body;

  // Debugging: Log the incoming request body
  console.log('Request Body:', req.body);

  // Validate if required fields are present
  if (!title || !author || !description || !price || !image) {
    console.error('Validation Failed: Missing required fields');
    return res.status(400).json({
      success: false,
      message: 'All fields (title, author, description, price, image) are required.',
    });
  }

  // Check if price is a valid number
  if (isNaN(price) || price <= 0) {
    console.error('Invalid Price:', price);
    return res.status(400).json({
      success: false,
      message: 'Price must be a positive number.',
    });
  }

  // SQL query to insert book data
  const query = 'INSERT INTO books (title, author, description, price, image) VALUES (?, ?, ?, ?, ?)';

  // Run the query
  db.query(query, [title, author, description, price, image], (err, result) => {
    if (err) {
      console.error('Error adding book:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to add book',
        error: err.message,
      });
    }

    // Debugging: Log successful insertion
    console.log('Book added successfully. Insert ID:', result.insertId);

    // Send a success response with the inserted book's ID
    res.json({
      success: true,
      message: 'Book added successfully!',
      bookId: result.insertId,
    });
  });
});


// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

