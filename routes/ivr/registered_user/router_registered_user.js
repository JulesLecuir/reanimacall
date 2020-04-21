const express = require('express');
const router = express.Router();
const { authPin, thankAfterMessage } = require('./handler_registered_user');

/*
 * POST: /ivr/reg/authPin
 */
router.post('/authPin', async (req, res) => {
    res.send(await authPin(req.body.From, req.body.Digits));
});


/*
 * POST: /ivr/reg/thankAfterMessage
 */
router.post('/thankAfterMessage', async (req, res) => {
    res.send(thankAfterMessage());
});

module.exports = router;