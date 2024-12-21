const express = require('express');
const app = express();
const path = require('path');

// Serve static files like CSS, JS
app.use(express.static(path.join(__dirname, 'public')));

// Root route to serve the portfolio
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My Portfolio</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
                color: #333;
            }
            header {
                background-color: #4CAF50;
                color: white;
                text-align: center;
                padding: 20px;
            }
            section {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20px;
            }
            .card {
                background-color: white;
                box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
                border-radius: 8px;
                padding: 20px;
                margin: 10px;
                width: 80%;
                max-width: 600px;
            }
            .card h2 {
                color: #4CAF50;
            }
            footer {
                background-color: #333;
                color: white;
                text-align: center;
                padding: 10px;
                position: fixed;
                bottom: 0;
                width: 100%;
            }
        </style>
    </head>
    <body>
        <header>
            <h1>Welcome to My Portfolio</h1>
        </header>

        <section>
            <div class="card">
                <h2>About Me</h2>
                <p>Hello! I'm a passionate web developer with a focus on front-end technologies. I enjoy creating user-friendly, responsive websites and exploring new technologies.</p>
            </div>
            <div class="card">
                <h2>Projects</h2>
                <ul>
                    <li><strong>Project 1</strong>: A dynamic weather app built with React and Node.js.</li>
                    <li><strong>Project 2</strong>: A personal blog built with Express and MongoDB.</li>
                    <li><strong>Project 3</strong>: A portfolio website built using HTML, CSS, and JavaScript.</li>
                </ul>
            </div>
            <div class="card">
                <h2>Contact</h2>
                <p>Feel free to reach out to me at <strong>myemail@example.com</strong> or connect with me on <a href="https://www.linkedin.com" target="_blank">LinkedIn</a>.</p>
            </div>
        </section>

        <footer>
            <p>&copy; 2024 My Portfolio</p>
        </footer>
    </body>
    </html>
  `);
});

// Define the port to listen on
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Portfolio app is running on http://localhost:${PORT}`);
});
