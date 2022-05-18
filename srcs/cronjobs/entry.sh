#!/bin/bash
while true
do
 node --no-warnings  new-booking-check.js
 node --no-warnings  repair-done-check.js
 sleep 5
done