
const db = require('../models/db');

const getTransactions = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1; // Default to page 1
    let limit = parseInt(req.query.limit) || 10; // Default limit 10 per page
    let offset = (page - 1) * limit;

    // Query to fetch paginated transactions
    const query = `
      SELECT 
        w.order_id, w.order_number, w.order_status, w.order_date, 
        w.order_total, w.order_shipping_total, w.order_payment_method, 
        w.billing_first_name, w.billing_last_name, w.billing_phone, w.billing_email, 
        w.shipping_city, w.shipping_state, w.location, 

        e.service_id, e.date_created, e.date_completed, e.pymt_method, 
        e.merchant_txn_id, e.gateway_txn_id, e.currency, e.amount, e.tot_refund_amt, 
        e.order_desc, e.card_pan, e.card_holder, e.acquirer, e.status, e.state, 
        e.auth_code, e.cust_name, e.cust_phone, e.cust_email, e.eci, e.bank_ref_no, 
        e.resp_mesg, e.svc_type, e.param6, e.param7, e.param16, e.issuing_bank, 
        e.card_type, e.checkout, e.tot_capture_amt, e.month_terms
      FROM woo_orders w
      LEFT JOIN eghl_transactions e 
        ON w.order_id = e.order_id
      WHERE e.date_created = (
        SELECT MAX(e2.date_created) 
        FROM eghl_transactions e2 
        WHERE e2.order_id = e.order_id
      )
      ORDER BY e.date_created DESC
      LIMIT ? OFFSET ?;
    `;

    // Query to count total transactions for pagination
    const countQuery = `
      SELECT COUNT(*) as total FROM woo_orders w
      LEFT JOIN eghl_transactions e 
        ON w.order_id = e.order_id
      WHERE e.date_created = (
        SELECT MAX(e2.date_created) 
        FROM eghl_transactions e2 
        WHERE e2.order_id = e.order_id
      );
    `;

    // Execute both queries
    const [rows] = await db.query(query, [limit, offset]);
    const [countResult] = await db.query(countQuery);
    const totalTransactions = countResult[0].total;
    const totalPages = Math.ceil(totalTransactions / limit);

    res.status(200).json({
      transactions: rows,
      currentPage: page,
      totalPages: totalPages,
      totalTransactions: totalTransactions
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error retrieving transactions', error });
  }
};


const getSearchTransactions = async (req, res) => {
  try {
    const { searchQuery } = req.query;  // Get search query and pagination parameters
    
    const query = `
      SELECT 
        w.order_id, w.order_number, w.order_status, w.order_date, 
        w.order_total, w.order_shipping_total, w.order_payment_method, 
        w.billing_first_name, w.billing_last_name, w.billing_phone, w.billing_email, 
        w.shipping_city, w.shipping_state, w.location, 

        e.service_id, e.date_created, e.date_completed, e.pymt_method, 
        e.merchant_txn_id, e.gateway_txn_id, e.currency, e.amount, e.tot_refund_amt, 
        e.order_desc, e.card_pan, e.card_holder, e.acquirer, e.status, e.state, 
        e.auth_code, e.cust_name, e.cust_phone, e.cust_email, e.eci, e.bank_ref_no, 
        e.resp_mesg, e.svc_type, e.param6, e.param7, e.param16, e.issuing_bank, 
        e.card_type, e.checkout, e.tot_capture_amt, e.month_terms
      FROM woo_orders w
      LEFT JOIN eghl_transactions e 
        ON w.order_id = e.order_id
      WHERE e.date_created = (
        SELECT MAX(e2.date_created) 
        FROM eghl_transactions e2 
        WHERE e2.order_id = e.order_id
      )
      AND (w.order_number LIKE ? OR w.billing_first_name LIKE ? OR w.billing_last_name LIKE ?);
    `;

    // Execute the query with search parameters
    const [rows] = await db.query(query, [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`]);

    res.status(200).json({
      transactions: rows,
      searchQuery,
    });


    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error retrieving transactions', error });
  }
};



module.exports = { getTransactions, getSearchTransactions };
