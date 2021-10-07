const jwt = require("jsonwebtoken");
const express = require("express");
const router = new express.Router();

const User = require("../models/user");
const {SECRET_KEY} = require('../config');
const ExpressError = require("../expressError");


/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async function(req, res, next) {
    try {
        const { username, password } = req.body;

        if(!username || !password) {
            throw new ExpressError("Username/Password required", 400);
        }

        const userAuth = await User.authenticate(username, password);

        if(userAuth) {
            let token = jwt.sign({ username }, SECRET_KEY);
            User.updateLoginTimestamp(username);

            return res.json({ token });
        }
        else {
            throw new ExpressError("Invalid Username/Password", 400);
        }
    }
    catch (err) {
        return next(err);
    }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async function(req, res, next) {
    try {
      let { username } = await User.register(req.body);
      let token = jwt.sign({ username }, SECRET_KEY);
      User.updateLoginTimestamp(username);

      return res.json({ token });
    } 
    catch (err) {
      return next(err);
    }
});

module.exports = router;