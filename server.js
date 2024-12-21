const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files (CSS, JS, Images)
app.use(express.static(path.join(__dirname, 'public')));

// Set up the view engine (EJS or Pug)
app.set('view engine', 'ejs');

// Serve the portfolio page
app.get('/', (req, res) => {
  res.render('index');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
