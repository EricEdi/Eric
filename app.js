const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());
// MySQL database connection
const db = mysql.createConnection({
  host: 'b0o3ed40uqooj2174vpd-mysql.services.clever-cloud.com',
  user: 'u1tpifvhcz18e5ni', // MySQL username
  password: 'o4FqeEWhYR3QgjOyqC7u', // MySQL password
  database: 'b0o3ed40uqooj2174vpd'
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

// Registration API
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  db.query(query, [username, email, hashedPassword], (err, result) => {
    if (err) {
      console.error('Error during registration:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    return res.status(201).json({ message: 'User registered successfully' });
  });
});

// Login API
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, result) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = result[0];

    // Compare the password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, 'secretkey', { expiresIn: '1h' });

    return res.status(200).json({ message: 'Login successful', token });
  });
});


// Get user API
app.get('/user', (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const userId = decoded.userId;

    const query = 'SELECT id, username, email FROM users WHERE id = ?';
    db.query(query, [userId], (err, result) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ user: result[0] });
    });
  });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
