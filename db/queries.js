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

async function addMessage(userId, title, text, dateAndTime, writtenBy) {
    try {
        console.log('Adding message for user ID:', userId, 'with title:', title);
        const result = await pool.query(
            'INSERT INTO messages (title, text, date_and_time, written_by, written_by_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, text, dateAndTime, writtenBy, userId]
        );
        console.log('Message added:', result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error('Error adding message:', error);
        throw error;
    }
}

async function getMessages() {
    try {
        const result = await pool.query('SELECT * FROM messages ORDER BY date_and_time DESC');
        console.log('Fetched messages:', result.rows);
        return result.rows;
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
}

async function getUserMessages(userId) {
    try {
       await pool.query('SELECT * FROM messages WHERE written_by_id = $1 ORDER BY date_and_time DESC', [userId]);
        const result = await pool.query('SELECT * FROM messages WHERE written_by_id = $1 ORDER BY date_and_time DESC', [userId]);
        console.log('Fetched user messages:', result.rows);
        return result.rows; 
    } catch (error) {
        console.error('Error fetching user messages:', error);
        throw error;
    }
}

async function updateUserData(userId, username, first_name, last_name, email) {
    try {
        console.log('Updating user data for user ID:', userId, 'with data:', { username, first_name, last_name, email });
        
        // First update the user
        const userResult = await pool.query(
            'UPDATE users SET username = $1, first_name = $2, last_name = $3, email = $4 WHERE id = $5 RETURNING *',
            [username, first_name, last_name, email, userId]
        );

        // Then update any messages written by this user
        if (userResult.rows[0]) {
            await pool.query(
                'UPDATE messages SET written_by = $1 WHERE written_by_id = $2',
                [username, userId]
            );
        }

        console.log('User data updated successfully');
        return userResult.rows[0];
    } catch (error) {
        console.error('Error updating user data:', error);
        throw error;
    }
}

async function deleteMessage(messageId) {
    try {
        await pool.query('DELETE FROM messages WHERE id = $1', [messageId]);
        console.log('Message deleted successfully');
    } catch (error) {
        console.error('Error deleting message:', error);
        throw error;
    }
}

async function getMessageById(messageId) {
    try {
        const result = await pool.query('SELECT * FROM messages WHERE id = $1', [messageId]);
        if (result.rows.length === 0) {
            throw new Error('Message not found');
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching message by ID:', error);
        throw error;
    }
    
}

module.exports = {
   getUserByName,
   getUserById,
   createUser,
   changeMembershipStatus,
   addMessage,
   getMessages,
   getUserMessages,
   updateUserData,
   deleteMessage,
   getMessageById
}