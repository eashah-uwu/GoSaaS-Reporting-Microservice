const pool = require('../config/db/db'); 

async function checkDatabaseConnection(req, res, next) {
  try {
    // Example query to check database connection
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Welcome to the Express app!', time: result.rows[0].now });
  } catch (err) {
    next(err);
  }
}

// Export the function directly
module.exports = checkDatabaseConnection;
