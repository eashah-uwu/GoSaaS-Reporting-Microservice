const { Pool } = require('pg');
const config = require('config');


const pool = new Pool(config.get('db'));

exports.getIndex = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Welcome to the Express app!', time: result.rows[0] });
  } catch (err) {
    next(err);
  }
};
