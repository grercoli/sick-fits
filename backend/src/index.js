// this file is going to start up our Node server, is the entry point of our application

require('dotenv').config({ path: '.env'});
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// TODO use express middleware to handle cookies (JWT: Jason web tokens)
// TODO use express middleware to populate current user

server.start({
    cors: { //we only want this endpoint to be able to be visited from our approved URLs (para que no pueda ser accedido el endpoint desde cualquier website)
        credentials: true,
        origin: process.env.FRONTEND_URL,
    },
}, deets => { //we get a callback function
    console.log(`Server is now running on port http:/localhost:${deets.port} `);
}); 