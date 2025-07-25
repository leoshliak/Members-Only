const pool = require('./pool.js');
const passport = require('passport');
const bcrypt = require("bcryptjs");

async function getUserByName(username) {
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching user by name:', error);
        throw error;
    }
}

async function getUserById(id) {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        throw error;
    }
}

async function createUser(username, password, first_name, last_name, email, membershipStatus = 'active') {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (username, password, first_name, last_name, email, membership_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [username, hashedPassword, first_name, last_name, email, membershipStatus]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

module.exports = {
   getUserByName,
   getUserById,
   createUser,
}