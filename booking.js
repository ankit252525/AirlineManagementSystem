const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MySQL connection setup
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "ankit123", // Replace with your MySQL password
  database: "airline_booking"
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1); // Exit process if connection fails
  }
  console.log("Connected to MySQL database");
});

// Booking API route
app.post("/book_ticket", (req, res) => {
  const { source, destination, departure_date, passenger_name, passenger_email } = req.body;

  // Input validation
  if (!source || !destination || !departure_date || !passenger_name || !passenger_email) {
    return res.status(400).send("All fields are required");
  }

  const sql = `INSERT INTO bookings (passenger_name, passenger_email, source, destination, departure_date) VALUES (?, ?, ?, ?, ?)`;
  const values = [passenger_name, passenger_email, source, destination, departure_date];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Insert failed:", err);
      return res.status(500).json({ error: "Error saving booking", details: err });
    }
    res.send("Booking saved successfully!");
  });
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});