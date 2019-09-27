// this file is going to start up our Node server, is the entry point of our application

const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env'});
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// Use express middleware to handle cookies (JWT: Jason web tokens)
server.express.use(cookieParser()); //server.express.use allows us to use any existing express middleware. server.express.use(cookieParser()): allow us to access all of the cookies in a nice formatted object rather than just a cookie string, that it normally comes in as a header.

// This gonna be our own custom middleware: decode the JWT so we can get the user Id on each request. Se ejecuta en cada request de una pagina
server.express.use((req, res, next) => {
    //pull the token out of the request
    const { token } = req.cookies;
    //decode that token
    if (token) {
        //take the userId out of the token
        const { userId } = jwt.verify(token, process.env.APP_SECRET);
        //put the userId onto the request for future requests to access
        req.userId = userId;
    }
    next(); //allow us to modify the request and then keep the request going so our Yoga server and the database would pick it up
});

// Create a middleware to populate current user on each request if they are logged in
server.express.use(async (req, res, next) => {
    // if they arent logged in, skip this
    if(!req.userId) {
        return next(); // we want this function to stop running
    }
    const user = await db.query.user({ where: { id: req.userId }}, '{ id, permissions, email, name }'); // como segundo parametro traemos los campos que queremos
    req.user = user;
    next();
});

server.start({
    cors: { //we only want this endpoint to be able to be visited from our approved URLs (para que no pueda ser accedido el endpoint desde cualquier website)
        credentials: true,
        origin: process.env.FRONTEND_URL,
    },
}, deets => { //we get a callback function
    console.log(`Server is now running on port http:/localhost:${deets.port} `);
}); 