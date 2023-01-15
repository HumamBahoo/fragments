# Fragments

## Description

Fragments is a REST API based on `node.js` that uses `Express` framework.

It is an ongoing practical project to be completed for the course CCP555 in the Computer Programming and Analysis program at Seneca College.

## Server Startup

``` sh
# starts server normally
npm start

# starts server using nodemon to restart it when changes happen
npm run dev

# starts server same as in dev, but also starts Node Inspector
# on port 9229 to attach a debugger (e.g., VSCode)
npm run debug
```

## Dependencies

### Prettier

This is a dev dependency that will be used to auto format source code files within the project

### ESLint

This is a dev dependency tool that will be used to find problems within the project's source files.

The script for using it from the command line is defined inside `package.json` scripts with the key `lint`. To use it:

``` sh
npm run lint
```
  
### Nodemon

This dev dependency tool that is used to automatically reload our server when there is a code change.

### Compression

A middleware used in our Express app that attempts to compress response bodies of our requests.

[More information](https://www.npmjs.com/package/compression)

### CORS

A middleware used in our Express app to make requests across origins.

[More information](https://www.npmjs.com/package/cors)

### Express

A Node.js framework to build web applications and APIs. This will be the framework used to build our app.

[More information](https://www.npmjs.com/package/express)

### Helmet

A middleware that helps in securing our application.

[More information](https://www.npmjs.com/package/helmet)

### Pino

A Node.js logger tool that is used to do Structured Logging and display nicely formatted JSON string.

[More information](https://getpino.io/#/)

### Stoppable

A tool to allow our server to exit gracefully when shutting down.

[More information](https://www.npmjs.com/package/stoppable)
