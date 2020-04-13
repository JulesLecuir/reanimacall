const express = require('express');
const twilio = require('twilio');

const router = express.Router();
const RegisteredUserRouter = require('./registered_user/router_registered_user');
const NewUserRouter = require('./new_user/router_new_user');

const { welcome, redirectWelcome } = require('./handler_welcome');


/*
 * POST: /ivr/welcome
 */
router.post('/welcome', (req, res) => {
  res.send(welcome(req.body.From));
});

/*
 * POST: /ivr/redirectWelcome
 */
router.post('/redirectWelcome', (req, res) => {
  res.send(redirectWelcome());
});


/*
 * Redirection to subrouters
 */

// For registered users
router.use('/reg', twilio.webhook({validate: false}), RegisteredUserRouter);

// For new users
router.use('/new', twilio.webhook({validate: false}), NewUserRouter);

module.exports = router;
