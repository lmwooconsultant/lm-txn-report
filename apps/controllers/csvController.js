const path = require('path');
const db = require('../models/db');
const parseCSV = require('../utils/csvParser');

// Upload CSV for Woo Orders
const uploadWooCSV = async (req, res) => {
  //if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const filePath = path.join(__dirname, '../../uploads', req.file.filename);

  try {

    if (!req.file) {
      return res.redirect("/upload?message=No file uploaded&type=error");
    }
    const records = await parseCSV(filePath);

    for (const record of records) {
      const orderID = record['Order ID'];

      // Check if order_id already exists
      const [existingOrder] = await db.query(`SELECT order_id FROM woo_orders WHERE order_id = ?`, [orderID]);

      if (existingOrder.length > 0) {
        console.log(`Skipping duplicate order_id: ${orderID}`);
        continue; // Skip duplicate entry
      }
      
      await db.query(
        `INSERT INTO woo_orders 
          (order_id, order_number, order_status, order_date, order_total, 
           order_shipping_total, order_payment_method, billing_first_name, 
           billing_last_name, billing_phone, billing_email, shipping_city, 
           shipping_state, location) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record['Order ID'],
          record['Order Number'],
          record['Order Status'],
          new Date(record['Order Date']),
          parseFloat(record['Order Total']),
          parseFloat(record['Order Shipping Total']),
          record['Order Payment Method'],
          record['Billing First Name'],
          record['Billing Last Name'],
          record['Billing Phone'],
          record['Billing Email'],
          record['Shipping City'],
          record['Shipping State'],
          record['Location']
        ]
      );
    }

    //res.status(201).json({ message: 'Woo CSV uploaded successfully' });
    return res.redirect("/upload?message=Woo CSV File uploaded successfully&type=success");
  } catch (err) {
    console.error(err);
    //res.status(500).json({ message: 'Error processing Woo CSV', error: err });
    return res.redirect("/upload?message=Error uploading file&type=error");
  }
};

// Upload CSV for EGHL Transactions
const uploadEghlCSV = async (req, res) => {
  //if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const filePath = path.join(__dirname, '../../uploads', req.file.filename);

  try {

    if (!req.file) {
      return res.redirect("/upload?message=No file uploaded&type=error");
    }

    const records = await parseCSV(filePath);


    for (const record of records) {

      // Remove "WC-" prefix if it exists
      let orderNumber = record['OrderNumber'] ? record['OrderNumber'].replace(/^WC-/, '') : null;
      
      await db.query(
        `INSERT INTO eghl_transactions 
          (service_id, date_created, date_completed, pymt_method, merchant_txn_id, 
           gateway_txn_id, order_id, currency, amount, tot_refund_amt, order_desc, 
           card_pan, card_holder, acquirer, status, state, auth_code, cust_name, 
           cust_phone, cust_email, eci, bank_ref_no, resp_mesg, svc_type, param6, 
           param7, param16, issuing_bank, card_type, checkout, tot_capture_amt, month_terms) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record['ServiceID'],
          new Date(record['DateCreated']),
          new Date(record['DateCompleted']),
          record['PymtMethod'],
          record['MerchantTxnID'],
          record['GatewayTxnID'],
          orderNumber,
          record['Currency'],
          parseFloat(record['Amount']),
          parseFloat(record['TotRefundAmt']),
          record['OrderDesc'],
          record['CardPAN'],
          record['CardHolder'],
          record['Acquirer'],
          record['Status'],
          record['State'],
          record['AuthCode'],
          record['CustName'],
          record['CustPhone'],
          record['CustEmail'],
          record['ECI'],
          record['BankRefNo'],
          record['RespMesg'],
          record['SvcType'],
          record['Param6'],
          record['Param7'],
          record['Param16'],
          record['IssuingBank'],
          record['CardType'],
          record['Checkout'],
          parseFloat(record['TotCaptureAmt']),
          parseInt(record['MonthTerms']) || null
        ]
      );
    }

    //res.status(201).json({ message: 'EGHL CSV uploaded successfully' });
    return res.redirect("/upload?message=EGHL CSV File uploaded successfully&type=success");
  } catch (err) {
    console.error(err);
    //res.status(500).json({ message: 'Error processing EGHL CSV', error: err });
    return res.redirect("/upload?message=Error uploading file&type=error");
  }
};

// Get Woo Orders Data
const getWooData = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM woo_orders');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving Woo orders', error: err });
  }
};

// Get EGHL Transactions Data
const getEghlData = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM eghl_transactions');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving EGHL transactions', error: err });
  }
};

module.exports = { uploadWooCSV, uploadEghlCSV, getWooData, getEghlData };
