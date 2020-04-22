#!/bin/bash

PHONE_NUMBER_ID='PN401be53f38f60fbcf07ebfc28d03b305'

get_ngrok_url() {
	echo $(curl http://127.0.0.1:4040/api/tunnels | sed -nE 's/.*public_url":"(https:..[^"]*).*/\1/p')
}

updatwilio(){
	url="$(get_ngrok_url)$1"
	twilio phone-numbers:update $PHONE_NUMBER_ID --voice-url=$url
}

# Start NGROK in background
~/ngrok http 3000 &

# Sleep while NGROK makes a connection
sleep 8

echo ""
echo "--------------------------------------------"
echo "|    STARTING MONGODB                      |"
echo "--------------------------------------------"

# Start MongoDB service
sudo systemctl start mongod

echo ""
echo "--------------------------------------------"
echo "|    UPDATING TWILIO API WITH NGROK URL    |"
echo "--------------------------------------------"

# Update the Twilio voice URL with the new NGROK link
updatwilio /ivr/welcome

echo ""
echo "--------------------------------------------"
echo "|    NGROK PID                             |"
echo "--------------------------------------------"

# Display the PID of NGROK for convenience
ps ax | grep /home/$USER/ngrok

