//this is where your databases calls are going to go, regardless of what database your using on the backend, in our case we are going to use Prisma

// const Query = { //in here i need to have a method on every single query that lines up exactly with the different queries that we have in schema.graphql
//     dogs(parent, args, ctx, info) { //each time that I have a request coming in, it's going to give you this sort of signature of four different variables: parent (it's the parent schema that we have in GraphQL), args (arguments that have been pased to the query), ctx (context: we give access to the database so we could surface the database), info (we get a whole bunch of information around the GraphQL query that's coming in)
//         return [{name: 'Snickers'}, {name: 'Pluto'}]; //aca estoy devolviendo algo hardcodeado pero podria alcanzar una REST API, o abrir un archivo CSV parsearlo y retornar esos valores, o traer valores de memoria. En nuestro caso estaremos trayendo los datos de una base de datos
//     }
// };

// Algo que puedo hacer en este Query es si el query es exactamente el mismo osea tal cual esta en Prisma y en esta query (items), si lo que tengo del lado de Yoga es lo mismo que esta en Prisma, puedes reenviar esa query de Yoga a Prisma, entonces no es necesario todo el codigo que esta abajo. Se hace por ejemplo si no necesito autenticar u otro tipo de cosas, si no necesito implementar custom logic
// const Query = {
//     async items(parent, args, ctx, info) {
//         const items = await ctx.db.query.items();
//         return items;
//     }
// };

const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

const Query = {
    items: forwardTo('db'),
    item: forwardTo('db'),
    itemsConnection: forwardTo('db'),
    me(parent, args, ctx, info) {
        // check if there is not a current user ID, so i have to access to the request
        if(!ctx.request.userId) {
            return null;
        }
        return ctx.db.query.user({ //devuelve el usuario, me puedo fijar como esta en las mutations de prisma.graphql. We are retorning a promise here so we do not need to wait for that to resolve
            where: { id: ctx.request.userId }
        }, info); // important to put info: the info is going to be the actual query that's coming from the client side
    },
    async users(parent, args, ctx, info) {
        // 1. Check if they are logged in
        if(!ctx.request.userId) { //como se repite varias veces en varios lados puedo crear una funcion para esto
            throw new Error('You must be logged in!');
        }
        // 2. Check if the user has the permissions to query all the users
        hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']); // si esto esta bien entonces el codigo va a seguir corriendo sino va a tirar un error: No tienes permisos suficientes
        // 3. If they do query all the users
        return ctx.db.query.users({}, info); // we can pass an empty where object because we just want to query all of the users. The info is going to include the graph QL query that contains the fields that we are requesting from the front end.
    }
};

module.exports = Query;
