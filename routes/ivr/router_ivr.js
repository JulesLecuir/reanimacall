const express = require('express');
const twilioWebhook = require('twilio').webhook;

const router = express.Router();
const RegisteredUserRouter = require('./registered_user/router_registered_user');
const NewUserRouter = require('./new_user/router_new_user');

const {welcome, redirectWelcome, mainMenu, offerMainMenu, noPinEntered, handleChoice} = require('./handler_ivr');

/*
 * Redirection to subrouters
 */
router.use('/reg', twilioWebhook({validate: false}), RegisteredUserRouter);
router.use('/new', twilioWebhook({validate: false}), NewUserRouter);


router.post('/welcome', async (req, res) => {
  res.send(await welcome(req.body.From));
});

router.post('/redirectWelcome', (req, res) => {
  res.send(redirectWelcome());
});

router.post('/offerMainMenu', (req, res) => {
  res.send(offerMainMenu());
});

router.post('/mainMenu', (req, res) => {
  res.send(mainMenu(req.body.Digits));
});

router.post('/noPinEntered', (req, res) => {
  res.send(noPinEntered());
});

// TODO debug : function currently used for debugging call problem
router.post('/handleChoice/:myParam', function (req, res) {
  res.send(handleChoice(req.params.myParam, req.body.Digits));
});

module.exports = router;
