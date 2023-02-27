# Dockerfile will be used to define instructions necessary 
# for Docker engine to build an image of the service

# Every docker file must start with FROM instruction to 
# to specify the start image.
FROM node:18.14.2

# Metadata about our image by using instruction LABEL
LABEL maintainer="Humam Bahoo hbahoo@myseneca.ca"
LABEL description="Fragments node.js microservice"

# Environment variables defined using ENV instruction
# These variables can be overwritten at runtime using 
# flags: --env, -e, or --env-file

# default to use port 8080 in our service
ENV PORT=8080

# reduce npm spam when installing within docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Define app working directory that we want to create for 
# our application using WORKDIR instruction
WORKDIR /app

# COPY instruction to copy files and folders into our image
# we will copy package.json and package-lock.json files into 
# /app because we need those dependencies
COPY package.json package-lock.json /app/

# This is another way to do it using a relative path and wildcards
# COPY package*.json ./

# RUN instruction is used to execute commands
# it will execute the command in a new layer on top of the image
# Install node dependencies defined in package-lock.json
RUN npm install

# Copy src to /app/src/
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# CMD isntruction is used to define the command used to start a process
CMD npm start

# To indicate teh port a container will listen on when running 
# we use EXPOSE instruction
EXPOSE 8080
