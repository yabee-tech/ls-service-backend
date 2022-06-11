#!/bin/bash
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]:-$0}"; )" &> /dev/null && pwd 2> /dev/null; )";
DURATION=10

printf 'This cron will run every 1 minute\n\n'

while true
do
	printf '🔄 Checking for new bookings...\n'
	node ${SCRIPT_DIR}/new-booking-check.js
	printf '🔄 Checking for repairs that are done...\n'
	node ${SCRIPT_DIR}/repair-done-check.js
	printf '🔄 Checking for confirmed bookings...\n'
	node ${SCRIPT_DIR}/booking-confirm-check.js
	printf '🔄 Backing up files...\n'
	node ${SCRIPT_DIR}/backup-tmpfiles.js
	printf '\n'
	sleep $DURATION
done
