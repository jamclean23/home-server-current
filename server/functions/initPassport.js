// Configuration for passport middleware

// ====== IMPORTS ======

// Mongoose
const mongoose = require('mongoose');
const User = require('../models/user.js');

// Passport
const LocalStrategy = require('passport-local').Strategy;

// Encryption
const bcrypt = require('bcryptjs');

// System
const path = require('path');

// Passport
const passport = require('passport');

// Environment variables
require('dotenv').config({
    path: path.join(__dirname, '../config/.env')
});

// ====== FUNCTIONS ======
/**
 * 
 * @returns An object with the initialize function
 */
function initialize () {
    async function authenticateUser (username, password, done) {
        console.log('Authenticating');
        let user;

        try {
            await mongoose.connect(process.env.MONGO_CONNECT_USER_DATA);
            user = await User.findOne({name: username});
            console.log('User: ');
            console.log(user);

            if (user == null) {
                console.log('User not found.');
                return done(null, false, { message: 'No user with that name.' });
            } else {
                console.log('User found.');
            }

            if (await bcrypt.compare(password, user.password)) {
                console.log('Password correct.');
                return done(null, user);
            } else {
                console.log('Password incorrect');
                return done(null, false, { message: 'Incorrect password' });
            }
        } catch (err) {
            console.log(err);
            return done(err);
        }
    };

    passport.use(
        new LocalStrategy({ usernameField: 'username' }, authenticateUser)
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        let user;
        try {
            await mongoose.connect(process.env.MONGO_CONNECT_USER_DATA);
            user = await User.findById(id);
            done(null, user);
        } catch (err) {
            console.log(err);
        }
    })

}

// ====== EXPORTS ======

module.exports = {
    initialize
}