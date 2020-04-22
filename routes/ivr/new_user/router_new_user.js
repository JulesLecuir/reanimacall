const {createAccount} = require('./handler_new_user');

const express = require('express');
const router = express.Router();


/*
 * POST: /ivr/new/createAccount
 */
router.post('/createAccount', async (req, res) => {
    res.send(await createAccount(req.body.From, req.body.Digits, req.body.CallSid));
});

module.exports = router;