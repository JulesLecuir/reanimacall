const express = require('express');
const router = express.Router();
const {authPin, thankAfterMessage, addContact, processMessage} = require('./handler_registered_user');


router.post('/authPin', async (req, res) => {
    res.send(await authPin(req.body.From, req.body.Digits, req.body.CallSid));
});

router.post('/thankAfterMessage', async (req, res) => {
    res.send(thankAfterMessage());
});

router.post('/processMessage', async function (req, res) {
    // TODO process the message properly
    res.send(await processMessage(req));
});

router.post('/addContact', async function (req, res) {
    res.send(await addContact());
});

module.exports = router;