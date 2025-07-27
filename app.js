const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// JSON data file
const filePath = path.join(__dirname, 'user_data.json');

// Utility function to load users
function loadUsers() {
  if (!fs.existsSync(filePath)) return [];

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to read user data:", err);
    return [];
  }
}

// ✨ Handle SIGNUP
app.post('/signup', (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();

  const alreadyExists = users.some(u => u.email === email);
  if (alreadyExists) {
    // Email already exists, show error page
    return res.redirect('/signup.html?error=Email already exists');
  }

  users.push({ email, password });
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');
  res.redirect('/thankyou.html');
});

// ✨ Handle LOGIN
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();

  const match = users.find(u => u.email === email && u.password === password);

  if (!match) {
    // Invalid credentials → back to login with query
    return res.redirect('/login.html?error=Wrong email or password');
  }

  // Successful login → go to thank you or dashboard
  res.redirect('/thankyou.html');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});