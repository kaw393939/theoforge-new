// Backend server for TheoForge
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');

// Create Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Configure middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// JWT secret
const JWT_SECRET = 'theoforge-secret-key';

// Mock user database
const users = [
  { 
    id: 1, 
    email: 'user@user.com', 
    password: 'SecurePass123!',
    first_name: 'user',
    last_name: '',
    role: 'USER'
  },
  { 
    id: 2, 
    email: 'admin@admin.com', 
    password: 'Password123!',
    first_name: 'admin',
    last_name: '',
    role: 'ADMIN'
  }
];

// Login route
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Find user
  const user = users.find(u => u.email === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ detail: 'Invalid credentials' });
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name
    }, 
    JWT_SECRET, 
    { expiresIn: '15m' }
  );
  
  res.json({ access_token: token });
});

// Registration route
app.post('/auth/register', (req, res) => {
  const { email, password, first_name, last_name, nickname } = req.body;
  
  // Check if user already exists
  if (users.some(u => u.email === email)) {
    return res.status(400).json({ detail: 'User with email ' + email + ' already exists' });
  }
  
  // Create new user
  const newUser = {
    id: users.length + 1,
    email,
    password,
    first_name: first_name || '',
    last_name: last_name || '',
    nickname: nickname || '',
    role: 'USER'
  };
  
  // Add to "database"
  users.push(newUser);
  
  res.status(201).json({ message: 'User created successfully' });
});

// Authentication check route
app.get('/auth/auth', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ 
      username: {
        email: decoded.email,
        role: decoded.role,
        first_name: decoded.first_name,
        last_name: decoded.last_name
      } 
    });
  } catch (err) {
    res.status(401).json({ detail: 'Invalid or expired token' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'TheoForge API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
