# Stage 01: install dependencies
################################
FROM node:18.14.2-alpine3.16@sha256:72c0b366821377f04d816cd0287360e372cc55782d045e557e2640cb8040d3ea AS dependencies

# define node env to install prod dependencies only
ENV NODE_ENV=production

# define work directory for our app
WORKDIR /fragments

# copy our package*.json dependencies
COPY package.json package-lock.json /fragments/

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# install app dependencies
RUN npm ci

# Stage 02: setup our app
#########################
FROM node:18.14.2-alpine3.16@sha256:72c0b366821377f04d816cd0287360e372cc55782d045e557e2640cb8040d3ea AS setup

# define work directory for our app
WORKDIR /fragments

# copy the generated node_modules folder from our dependencies layer
COPY --from=dependencies /fragments /fragments

# copy our source code
COPY ./src/ /fragments/src/
COPY ./tests/.htpasswd ./tests/.htpasswd

# Stage 03: run our app
#########################
FROM node:18.14.2-alpine3.16@sha256:72c0b366821377f04d816cd0287360e372cc55782d045e557e2640cb8040d3ea AS run

# set image metadata
LABEL maintainer="Humam Bahoo <hbahoo@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# define work directory for our app
WORKDIR /fragments

# copy everything from our setup layer
COPY --from=setup /fragments /fragments

# install curl for our Healthcheck
RUN apk --no-cache --update add curl

# define our env variables
ENV PORT=8080

# run our app and expose port 8080
CMD [ "node" ,"src/index.js"]
EXPOSE 8080

# define our healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl --fail localhost:8080 || exit 1
