#!/bin/bash

PHONE_NUMBER_ID='PN401be53f38f60fbcf07ebfc28d03b305'

get_ngrok_url() {
	echo $(curl http://127.0.0.1:4040/api/tunnels | sed -nE 's/.*public_url":"(https:..[^"]*).*/\1/p')
}

updatwilio(){
	url="$(get_ngrok_url)$1"
	twilio phone-numbers:update $PHONE_NUMBER_ID --voice-url=$url
}

~/ngrok http 3000 &
sleep 6
updatwilio /ivr/welcome
ps ax | grep /home/$USER/ngrok

