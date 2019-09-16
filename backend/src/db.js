//This files connects to the remote prisma DB and gives us the ability to query it with JS

const { Prisma } = require('prisma-binding'); //es asi porque no hay imports en NodeJs, entonces desde el servidor usamos require

const db = new Prisma({
    typeDefs: 'src/generated/prisma.graphql', 
    endpoint: process.env.PRISMA_ENDPOINT, //then we also need to give it access to our Prisma DB (it's in the .env file)
    secret: process.env.PRISMA_SECRET, //en prisma.yml si lo hubiese puesto en prod, ese seria el secret
    debug: false //true: consult that log, all of the queries and mutations. Solo lo pongo en true si lo necesito
});

module.exports = db;