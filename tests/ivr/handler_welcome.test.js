const {welcome} = require('../../routes/ivr/handler_welcome');
const Helper = require('./../helper');

describe('#Welcome', () => {
  describe('If user already registered', () => {
    it('should welcome the user and ask for a PIN', () => {

      const twiml = welcome( "+33685049061");

      expect(twiml).toContain('Bonjour');
      expect(twiml).toContain('Gather');
      expect(twiml).toContain('Say');
      expect(twiml).toContain('action="/ivr/reg/authPin"');
      expect(twiml).toContain('loop="3"');

    });
  }
);


describe('IvrHandler#MainMenu', () => {
  it('should redirect to welcomes with digits other than 1 or 2', () => {
    const twiml = mainMenu();
    const count = Helper.countWord(twiml);

    // TwiML verbs
    expect(count('Say')).toBe(2);
    expect(count('Say')).toBe(2);

    // TwiML content
    expect(twiml).toContain('welcome');
  });

  it('should serve TwiML with say twice and hangup', () => {
    const twiml = mainMenu('1');
    const count = Helper.countWord(twiml);

    // TwiML verbs
    expect(count('Say')).toBe(2);

    // TwiML content
    /*expect(twiml).toContain(
      'Well done!'
    );*/
  });

  it('should serve TwiML with gather and say', () => {
    const twiml = mainMenu('2');
    const count = Helper.countWord(twiml);

    // TwiML verbs
    expect(count('Gather')).toBe(2);
    expect(count('Say')).toBe(2);

    // TwiML options
    expect(twiml).toContain('action="/ivr/planets"');
    expect(twiml).toContain('numDigits="1"');

    // TwiML content
    expect(twiml).toContain(
      'To call the planet Broh doe As O G, press 2. To call the planet DuhGo ' +
      'bah, press 3. To call an oober asteroid to your location, press 4. To ' +
      'go back to the main menu, press the star key '
    );
  });
});


