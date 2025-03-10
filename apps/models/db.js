const db = require('../../config/database');

const createTables = async () => {
  try {
    // Create woo_orders table
    await db.query(`
      CREATE TABLE IF NOT EXISTS woo_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL,
        order_number VARCHAR(50) NOT NULL,
        order_status VARCHAR(50),
        order_date DATETIME,
        order_total DECIMAL(10,2),
        order_shipping_total DECIMAL(10,2),
        order_payment_method VARCHAR(100),
        billing_first_name VARCHAR(100),
        billing_last_name VARCHAR(100),
        billing_phone VARCHAR(50),
        billing_email VARCHAR(255),
        shipping_city VARCHAR(100),
        shipping_state VARCHAR(100),
        location TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_order_id (order_id),
        INDEX idx_order_number (order_number),
        INDEX idx_order_date (order_date),
        INDEX idx_billing_email (billing_email)
      )
    `);

    // Create eghl_transactions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS eghl_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        service_id VARCHAR(50) NOT NULL,
        date_created DATETIME,
        date_completed DATETIME,
        pymt_method VARCHAR(100),
        merchant_txn_id VARCHAR(100),
        gateway_txn_id VARCHAR(100),
        order_id VARCHAR(50),
        currency VARCHAR(10),
        amount DECIMAL(10,2),
        tot_refund_amt DECIMAL(10,2),
        order_desc TEXT,
        card_pan VARCHAR(50),
        card_holder VARCHAR(100),
        acquirer VARCHAR(100),
        status VARCHAR(50),
        state VARCHAR(50),
        auth_code VARCHAR(50),
        cust_name VARCHAR(100),
        cust_phone VARCHAR(50),
        cust_email VARCHAR(255),
        eci VARCHAR(50),
        bank_ref_no VARCHAR(50),
        resp_mesg TEXT,
        svc_type VARCHAR(100),
        param6 VARCHAR(255),
        param7 VARCHAR(255),
        param16 VARCHAR(255),
        issuing_bank VARCHAR(100),
        card_type VARCHAR(50),
        checkout VARCHAR(50),
        tot_capture_amt DECIMAL(10,2),
        month_terms INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_service_id (service_id),
        INDEX idx_order_id (order_id),
        INDEX idx_date_created (date_created),
        INDEX idx_cust_email (cust_email)
      )
    `);

    console.log('Tables created successfully');
  } catch (err) {
    console.error('Error creating tables:', err);
  }
};

// Run the function to create tables
createTables();

module.exports = db;
