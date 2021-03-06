# REANIMACALL

A phone app for the medical staff in France. 

## So... what's that?

Reanimacall answers a common problem in hospitals: when you have to find some space to transfer a patient in any service, 
when you have to find some equipment but have to call a haf-dozen of persons before getting one, etc.

Instead of calling sequentially every potential person that has the ability to answer our request, why not call a unique 
number, record our request on the phone and let the robot on the other side of the line do the dirty work for you, while
you can free up some time for what counts really: doing your job, rather than calling your colleagues.

## How it works

Reanimacall relies massively on the [Twilio API][1]. It uses it to make and receive calls. The app
is based on NodeJS and the Express framework. All it does is exchange info with the TWilio API.


## How to install?

### What you'll need

You'll need several things:

#### `ngrok`

To develop locally, you need to [install `ngrok`][2]. Twilio can't send requests to your PC as you are in a local network, so
`ngrok` creates a webhook for you: a public url on which Twilio can send requests. The requests are then tunelled to 
your PC. For that you'll need to set up the voice URL webhook in your Twilio account for the number you want to use. Or
you can use directly the `launchservices.sh` script that auto-updates the webhook each time you start the app. But for 
that, you'll need to install... 

#### `twilio-cli`
Quite handy to make request to your Twilio account. You will need it if you want to use the `launchservices.sh` script

#### `mongod` 
The app uses a MongoDB database so you'll need to have a [MongoDB server installed][3] 
on your computer.

[1]: https://www.twilio.com/
[2]: https://ngrok.com/
[3]: https://docs.mongodb.com/guides/server/install/

### Basic setup

#### Create a `.env` file

The app needs to know some environment variables in order to run: the MongoDB URL and port to listen to, and your Twilio 
phone number ID, so that the `launchsservices.sh` script can work properly. 
Create a doc with those following variables, as below. The values correspond to my own setup, but you can adapt:

```$xslt
# Database setup
DB_HOST=mongodb://localhost:27017/
PORT=3000

# Phone number (with country code) and phone number ID
TWILIO_PHONE_NUMBER=+33xxxxxxxx
TWILIO_PHONE_NUMBER_ID=PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Absolute path where the ngrok exectuable is located
NGROK_EXECUTABLE=/home/$USER/ngrok

# This is the first address that Twilio will sent a request to when some user calls your number.
# For example if WEBHOOK_PATH=/ivr/welcome, if a user call your Twilio number, Twilio will send a request to
# the URL https://xxxxxxxx.ngrok.io/ivr/welcome.
$WEBHOOK_PATH=/ivr/welcome

# Twilio account SID and authorization token used to make outbound calls
TWILIO_ACCOUNT_SID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Change the language options and database names in `config.json`

The language and diction options are listed in the variable `config.voice`. Basically the language is french but you can adapt it to another language. Twilio Docs can show you how to do that.

#### And last but not least: `npm install`

Run `npm` to install required modules and you'll be all set up.

## Launch the app

First of all, you need to execute the `launchservices.sh` script. All it does is:
- launch ngrok and create a bridge to a new URL
- update your Twilio API so the webhook matches the new generated ngrok URL.
- launch MongoDB (and probably ask for your password cause it needs root access)
- then display the ngrok URL
- and for convenience purpose, display the PID of the ngrok instance, so you can kill it easily if you need to restart it for some reason.

The terminal session that you used to launch the `launchservices.sh` script will stay frozen (probably because of ngrok running). I recommend keeping this session open and using another session to run your other commands.

Once it's done, all you have to do is launch the tests to see if everything is okay with `npm test`, and then you're good to go! Please see the `package.json` file to know which command to type.

## Final word
I hope you'll enjoy working on the app! Leave me a comment if you face any issue.

Cheers,

Jules