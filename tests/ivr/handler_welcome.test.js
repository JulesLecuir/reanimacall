const {welcome} = require('../../routes/ivr/handler_ivr');

describe('#Welcome', function () {

    describe('If user already registered', function () {

        // TODO throws a timeout error, Jest is just stuck waiting and fails after timeout.
        // it('should welcome the user and ask for a PIN', async function () {
        //
        //     const twiml = await welcome("+33685049061");
        //
        //     expect(twiml).toContain('Bonjour');
        //     expect(twiml).toContain('Gather');
        //     expect(twiml).toContain('Say');
        //     expect(twiml).toContain('action="/ivr/reg/authPin"');
        //     expect(twiml).toContain('loop="3"');
        //
        // });


    });
});