#base image
FROM node

ADD . /ls-backend-web
WORKDIR /ls-backend-web

#RUN
RUN npm install
RUN npm install -g nodemon

EXPOSE 3000

CMD ["npm", "run", "dev"]