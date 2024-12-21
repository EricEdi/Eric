const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin', // Update with your MySQL password
  database: 'instagram_clone'
});

// Connect to MySQL
db.connect((err) => {
  if (err) throw err;
  console.log('MySQL Connected...');
});

// JWT Secret
const JWT_SECRET = 'your_jwt_secret';

// Helper function to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Access Denied');
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid Token');
    req.user = user;
    next();
  });
};

// Get all follow requests for the logged-in user (including the sender's info)
app.get('/follow-requests', verifyToken, (req, res) => {
    const userId = req.user.id;
  
    // Query the follow_requests table to get all requests where the logged-in user is the recipient
    db.query('SELECT fr.id, fr.from_user_id, u.username AS sender_username, u.email AS sender_email, fr.status FROM follow_requests fr JOIN users u ON fr.from_user_id = u.id WHERE fr.to_user_id = ?', [userId], (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.length === 0) return res.status(404).send('No follow requests found');
      
      // Send the follow requests with sender information (username, email, etc.)
      res.json(result);
    });
  });
  

// Fetch User Profile (Authenticated Route)
app.get('/profile', verifyToken, (req, res) => {
    const userId = req.user.id;
    
    db.query('SELECT id, username, email FROM users WHERE id = ?', [userId], (err, result) => {
      if (err) return res.status(500).send(err);
      if (!result[0]) return res.status(404).send('User not found');
      
      res.json(result[0]); // Send back the logged-in user's profile
    });
  });
  

// Register User
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).send(err);
    
    db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], (err, result) => {
      if (err) return res.status(500).send(err);
      res.status(201).send('User Registered');
    });
  });
});

// Login User
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) return res.status(500).send(err);
    
    const user = result[0];
    if (!user) return res.status(404).send('User not found');
    
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).send(err);
      if (!isMatch) return res.status(400).send('Invalid credentials');
      
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
      res.json({ token });
    });
  });
});

// Send Follow Request
app.post('/follow/:userId', verifyToken, (req, res) => {
  const fromUserId = req.user.id;
  const toUserId = req.params.userId;

  if (fromUserId === toUserId) return res.status(400).send("You can't follow yourself");

  db.query('SELECT * FROM users WHERE id = ?', [toUserId], (err, result) => {
    if (err) return res.status(500).send(err);
    
    const user = result[0];
    if (!user) return res.status(404).send('User not found');
    
    // Check if private account
    if (user.is_private) {
      db.query('INSERT INTO follow_requests (from_user_id, to_user_id) VALUES (?, ?)', [fromUserId, toUserId], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send('Follow request sent');
      });
    } else {
      // If the account is public, automatically add to followers
      db.query('INSERT INTO followers (user_id, follower_id) VALUES (?, ?)', [toUserId, fromUserId], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send('Followed successfully');
      });
    }
  });
});

// Accept Follow Request
app.post('/accept-follow/:requestId', verifyToken, (req, res) => {
  const requestId = req.params.requestId;
  
  db.query('SELECT * FROM follow_requests WHERE id = ? AND to_user_id = ?', [requestId, req.user.id], (err, result) => {
    if (err) return res.status(500).send(err);
    
    const request = result[0];
    if (!request) return res.status(404).send('Follow request not found');
    
    db.query('UPDATE follow_requests SET status = ? WHERE id = ?', ['approved', requestId], (err, result) => {
      if (err) return res.status(500).send(err);
      
      // Add to followers table
      db.query('INSERT INTO followers (user_id, follower_id) VALUES (?, ?)', [request.to_user_id, request.from_user_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send('Follow request accepted');
      });
    });
  });
});

// Deny Follow Request
app.post('/deny-follow/:requestId', verifyToken, (req, res) => {
  const requestId = req.params.requestId;
  
  db.query('SELECT * FROM follow_requests WHERE id = ? AND to_user_id = ?', [requestId, req.user.id], (err, result) => {
    if (err) return res.status(500).send(err);
    
    const request = result[0];
    if (!request) return res.status(404).send('Follow request not found');
    
    db.query('UPDATE follow_requests SET status = ? WHERE id = ?', ['denied', requestId], (err, result) => {
      if (err) return res.status(500).send(err);
      res.send('Follow request denied');
    });
  });
});

// Get all users
app.get('/users', verifyToken, (req, res) => {
    // You can modify this query to return only specific user fields (e.g., excluding password)
    db.query('SELECT id, username, email, is_private FROM users', (err, result) => {
      if (err) return res.status(500).send(err);
      res.json(result); // Return the list of users
    });
  });

  // Get a specific user by ID
app.get('/users/:id', verifyToken, (req, res) => {
    const userId = req.params.id;
    
    db.query('SELECT id, username, email, is_private FROM users WHERE id = ?', [userId], (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.length === 0) return res.status(404).send('User not found');
      res.json(result[0]); // Return the user details
    });
  });
  
  

// Start Server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
