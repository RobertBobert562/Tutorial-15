const express = require("express");
const app = express();
const path = require("path");
const { Pool } = require("pg");
const dotenv = require('dotenv');

dotenv.config();

// Use EJS template engine
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

// Create a database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Define the /data route
app.get('/data', (req, res) => {
    const model = {
      title: 'My Data',
      items: ['item 1', 'item 2', 'item 3']
    };
    res.render('data', { model: model });
  });

  app.post("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM Books WHERE Book_ID = $1";
    pool.query(sql, [id], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Server Error");
        return;
      }
      res.redirect("/books");
    });
  });

  app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Books WHERE Book_ID = $1";
    pool.query(sql, [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Server Error");
      }
      const model = {
        item: result.rows[0]
      };
      res.render("edit", { model: model });
    });
  });
  

app.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    const { title, author, comments } = req.body;
    const sql = "UPDATE Books SET Title = $1, Author = $2, Comments = $3 WHERE Book_ID = $4";
    const values = [title, author, comments, id];
    
    pool.query(sql, values, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Server Error");
        return;
      }
      
      res.redirect("/books");
    });
  });

// GET /create
app.get("/create", (req, res) => {
    res.render("create", { model: {} });
  });

// POST /create
app.post("/create", (req, res) => {
    const sql = "INSERT INTO Books (Title, Author, Comments) VALUES ($1, $2, $3)";
    const book = [req.body.title, req.body.author, req.body.comments];
    pool.query(sql, book, (err, result) => {
      // if (err) ...
      res.redirect("/books");
    });
  });

// Render index.ejs view
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/books", (req, res) => {
    const sql = "SELECT Book_ID, Title, Author, Comments FROM Books ORDER BY Title";
    pool.query(sql, [], (err, result) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("books", { model: result.rows });
    });
  });

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Books WHERE Book_ID = $1";
    pool.query(sql, [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Server Error");
      }
      const model = {
        item: result.rows[0]
      };
      res.render("delete", { model: model });
    });
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
