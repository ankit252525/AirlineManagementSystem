console.log("File started...");

const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const PDFDocument = require('pdfkit');
const fs = require('fs');
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use('/tickets', express.static('tickets'));

// Ensure tickets folder exists on server startup
const ticketsDir = './tickets';
if (!fs.existsSync(ticketsDir)) {
  fs.mkdirSync(ticketsDir);
  console.log('Tickets folder created.');
}

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'ankit123',
  database: process.env.DB_NAME || 'airline_db'
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection failed:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { username, email, phone, address, pincode, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(`Sign up request: ${JSON.stringify(req.body)}`);

  const query = 'INSERT INTO users (name, email, phone, address, pincode, password) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [username, email, phone, address, pincode, hashedPassword], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Failed to save user details' });
    }
    console.log(`User ${username} registered successfully.`);
    res.status(201).json({ message: 'User registered successfully' });
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log(`Login request: ${email}`);

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Database query failed:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    if (results.length === 0) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ error: 'User not found. Please sign up first.' });
    }

    const user = results[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log(`User ${user.name} logged in successfully.`);
    res.status(200).json({ message: 'Login successful', user: { username: user.name, email: user.email } });
  });
});

// Define valid flight routes
const validRoutes = [
  { source: 'Patna', destination: 'Delhi' },
  { source: 'Delhi', destination: 'Patna' },
  { source: 'Mumbai', destination: 'Bangalore' },
  { source: 'Bangalore', destination: 'Mumbai' },
  { source: 'Kolkata', destination: 'Chennai' },
  { source: 'Chennai', destination: 'Kolkata' }
];

// Book ticket endpoint
app.post('/book-ticket', (req, res) => {
  const { email, password, flightDetails } = req.body;
  const { source, destination, departureDate, departureTime, price } = flightDetails;

  console.log(`Booking request for user: ${email}`);

  // Check if the selected route is available
  const routeAvailable = validRoutes.some(route => 
    route.source === source && route.destination === destination
  );

  if (!routeAvailable) {
    return res.status(404).json({ message: 'No flights available on this route.' });
  }

  // Fetch user from database and authenticate
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Database query failed:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    if (results.length === 0) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ error: 'User not found. Please sign up first.' });
    }

    const user = results[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Save booking details in database
    const bookingQuery = `
      INSERT INTO bookings (passenger_name, passenger_email, source, destination, departure_date)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(
      bookingQuery,
      [user.name, user.email, source, destination, departureDate],
      (bookingErr, bookingResult) => {
        if (bookingErr) {
          console.error('Error saving booking details:', bookingErr);
          return res.status(500).json({ error: 'Failed to save booking details' });
        }

        // Generate PDF for the ticket
        const doc = new PDFDocument();
        const fileName = `ticket_${Date.now()}.pdf`;
        const filePath = `${ticketsDir}/${fileName}`;

        doc.pipe(fs.createWriteStream(filePath));
        doc.fontSize(25).text('Flight Ticket', { align: 'center' });
        doc.moveDown();
        doc.fontSize(18).text(`Name: ${user.name}`);
        doc.text(`Email: ${user.email}`);
        doc.text(`Phone: ${user.phone}`);
        doc.moveDown();
        doc.text(`Flight Details:`);
        doc.text(`Source: ${source}`);
        doc.text(`Destination: ${destination}`);
        doc.text(`Departure Time: ${departureTime}`);
        doc.text(`Price: $${price}`);
        doc.moveDown();
        doc.fontSize(12).text('Please carry a valid ID and arrive 2 hours before departure.');
        doc.end();

        console.log(`Booking saved, ticket generated for user: ${user.name}`);
        res.status(200).json({
          message: 'Ticket booked successfully',
          flightDetails,
          pdf: filePath,
          bookingId: bookingResult.insertId
        });
      }
    );
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});