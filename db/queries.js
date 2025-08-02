const pool = require('./pool.js');
const passport = require('passport');
const bcrypt = require("bcryptjs");

async function getUserByName(username) {
    try {
        console.log('Looking for user with username:', username);
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        console.log('Database query result:', result.rows[0]); // Log the raw result
        if (result.rows[0]) {
            console.log('Found user with password:', result.rows[0].password); // Log the stored password
        }
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

async function createUser(username, password, name, surname, email, membershipStatus = false) {
    try {
        console.log('Creating user with:', { username, name, surname, email }); // Log input data
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password created');
        const result = await pool.query(
            'INSERT INTO users (username, password, first_name, last_name, email, membership_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [username, hashedPassword, name, surname, email, membershipStatus]
        );
        console.log('User created:', result.rows[0]); // Log the created user
        return result.rows[0];
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

async function changeMembershipStatus(userId, status) {
    try {
        console.log('Changing membership status for user ID:', userId, 'to status:', status);
        const result = await pool.query(
            'UPDATE users SET membership_status = $1 WHERE id = $2',
            [status, userId]
        );
        console.log('Membership status changed successfully');
        return true; // Indicate success
    } catch (error) {
        console.error('Error changing membership status:', error);
        throw error;
    }
}

module.exports = {
   getUserByName,
   getUserById,
   createUser,
   changeMembershipStatus,
}