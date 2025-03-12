const express = require('express');
const dotenv = require('dotenv');
const csvRoutes = require('./apps/routes/csvRoutes');
const authRoutes = require('./apps/routes/authRoutes');
const { verifyFirebaseToken, isAuthenticated } = require('./apps/middleware/authMiddleware');
const axios = require("axios");

dotenv.config();
const app = express();
const path = require('path');
const PORT = process.env.PORT || 5000;

const session = require("express-session");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(
  session({
    secret: "HappyHormones", // Change this to a strong secret
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true } // Set `secure: true` if using HTTPS
  })
);


// Set EJS as the template engine
app.set('views', path.join(__dirname, 'apps/views'));
app.set('view engine', 'ejs');

// Serve static files (CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse form data

// Serve login page
app.get('/login', (req, res) => {
  res.render('login');
});

// Routes
app.get('/', isAuthenticated, async (req, res) => {

  let page = parseInt(req.query.page) || 1; // Default to page 1


  try {
    const response = await axios.get(`http://localhost:${PORT}api/txn?page=${page}&limit=10`); // Adjust URL if needed
    const transactions = response.data.transactions; // Assuming API returns JSON array
    const currentPage = response.data.currentPage; // Assuming API returns JSON array
    const totalPages = response.data.totalPages; // Assuming API returns JSON array
    const totalTransactions = response.data.totalTransactions; // Assuming API returns JSON array

    //console.log(req.session.user);

    res.render("index", { title: 'Home Page', transactions, currentPage, totalPages, totalTransactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
  }
});

app.get('/search', isAuthenticated, async  (req, res) => {
  //let searchQuery = parseInt(req.query.searchQuery)|| ''; // Default to page 1
  try {
    let { searchQuery, order_status, order_payment_method, location, status, state } = req.query;

    // Check if all filters are empty or undefined
    const isEmptySearch =
      (!searchQuery || searchQuery.trim() === "undefined" || searchQuery.trim() === "") &&
      (!order_status || order_status.trim() === "undefined" || order_status.trim() === "") &&
      (!order_payment_method || order_payment_method.trim() === "undefined" || order_payment_method.trim() === "") &&
      (!location || location.trim() === "undefined" || location.trim() === "") &&
      (!status || status.trim() === "undefined" || status.trim() === "") &&
      (!state || state.trim() === "undefined" || state.trim() === "");

    if (isEmptySearch) {
      return res.render("searchResults", { title: 'Search Result Page', transactions: [] }); 
    }

    // Construct query parameters dynamically
    let queryParams = new URLSearchParams();

    if (searchQuery && searchQuery.trim() !== '') queryParams.append("searchQuery", searchQuery);
    if (order_status && order_status.trim() !== '') queryParams.append("order_status", order_status);
    if (order_payment_method && order_payment_method.trim() !== '') queryParams.append("order_payment_method", order_payment_method);
    if (location && location.trim() !== '') queryParams.append("location", location);
    if (status && status.trim() !== '') queryParams.append("status", status);
    if (state && state.trim() !== '') queryParams.append("state", state);

    let url = `http://localhost:${PORT}api/search?${queryParams.toString()}`;
    const response = await axios.get(url); // Adjust URL if needed
    const transactions = response.data.transactions || []; // Assuming API returns a JSON array

    res.render("searchResults", { title: 'Search Result Page', transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
  }
});

app.get('/upload', isAuthenticated, (req, res) => {
  res.render('upload', { 
    title: "Upload CSV File",
    message: req.query.message || "",
    type: req.query.type || "",
  });
});

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/csv', csvRoutes);
app.use('/api', csvRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
