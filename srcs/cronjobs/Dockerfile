FROM node:latest

# Install dependencies
# RUN npm install -g stuff

# Copy entrypoint sh into working directory
COPY entry.sh .
 
# Copy check for new booking script into working directory
COPY new-booking-check.js .

# Copy check for repair finish script into working directory
COPY repair-done-check.js .

# Run the command on container startup
CMD ["bash", "entry.sh"]