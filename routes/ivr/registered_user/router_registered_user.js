const express = require('express');
const router = express.Router();
const {authPin, thankAfterMessage, addContact, processMessage, askContactRecursive} = require('./handler_registered_user');


router.post('/authPin', async (req, res) => {
    res.send(await authPin(req.body.From, req.body.Digits, req.body.CallSid));
});

router.post('/thankAfterMessage', async (req, res) => {
     res.send(await thankAfterMessage(req.body.CallSid, req.body.RecordingUrl));
});

router.post('/processMessage', function (req, res) {
    res.send(processMessage(req.body.RecordingUrl, req.body.CallSid))

});

router.post('/addContact', async function (req, res) {
    res.send(await addContact(req.body.From, req.body.Digits));
});


// router.param('contactIndex', function(req, res, next, name) {
//     req.contactIndex = ;
//     next();
// });

router.get('/askContactRecursive', async function (req, res) {
    res.send(await askContactRecursive(req.body.From, req.body.Digits, req.params.contactIndex, req.body.RecordingUrl, messageUrl, digits = null));
});

module.exports = router;