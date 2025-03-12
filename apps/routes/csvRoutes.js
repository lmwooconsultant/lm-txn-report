const express = require('express');
const multer = require('multer');
const { uploadWooCSV, uploadEghlCSV, getWooData, getEghlData } = require('../controllers/csvController');
const { getTransactions, getSearchTransactions } = require('../controllers/txnController');
const db = require('../models/db');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Ensure this is correct

// Woo CSV Routes
router.post('/upload/woo', upload.single('wooFile'), uploadWooCSV);
router.get('/data/woo', getWooData);

// EGHL CSV Routes
router.post('/upload/eghl', upload.single('eghlFile'), uploadEghlCSV); // Ensure field is 'file'
router.get('/data/eghl', getEghlData);

// New API for fetching combined transactions
router.get('/txn', getTransactions);
router.get('/search', getSearchTransactions);

router.get("/filters", async (req, res) => {
    try {
      const [orderStatus] = await db.query("SELECT DISTINCT order_status FROM woo_orders");
      const [paymentMethods] = await db.query("SELECT DISTINCT order_payment_method FROM woo_orders");
      const [locations] = await db.query("SELECT DISTINCT location FROM woo_orders");
      const [eghlStatus] = await db.query("SELECT DISTINCT status FROM eghl_transactions");
      const [eghlState] = await db.query("SELECT DISTINCT state FROM eghl_transactions");
  
      res.json({
        orderStatus: orderStatus.map(row => row.order_status),
        paymentMethods: paymentMethods.map(row => row.order_payment_method),
        locations: locations.map(row => row.location),
        eghlStatus: eghlStatus.map(row => row.status),
        eghlState: eghlState.map(row => row.state),
      });
    } catch (error) {
      console.error("Error fetching filter values:", error);
      res.status(500).json({ message: "Error fetching filter values" });
    }
  });

module.exports = router;
