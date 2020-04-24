#!/bin/bash

# get the $PHONE_NUMBER_ID in the .env file
source .env

get_ngrok_url() {
	echo $(curl http://127.0.0.1:4040/api/tunnels | sed -nE 's/.*public_url":"(https:..[^"]*).*/\1/p')
}

updatwilio(){
	url="$(get_ngrok_url)$1"
	twilio phone-numbers:update $PHONE_NUMBER_ID --voice-url=$url
}

# Start NGROK in background
$NGROK_EXECUTABLE http 3000 &

sleep 4

echo ""
echo "--------------------------------------------"
echo "|    STARTING MONGODB                      |"
echo "--------------------------------------------"

# Sleep while NGROK initialized a connection
sleep 1
echo "Please only type your password when ngrok has initialized the webhook URLs!"

# Start MongoDB service
sudo systemctl start mongod

# start Mongo Compass
mongodb-compass&

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
ps ax | grep $NGROK_EXECUTABLE

