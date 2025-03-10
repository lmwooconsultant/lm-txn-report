const express = require('express');
const multer = require('multer');
const { uploadWooCSV, uploadEghlCSV, getWooData, getEghlData } = require('../controllers/csvController');
const { getTransactions, getSearchTransactions } = require('../controllers/txnController');

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

module.exports = router;
