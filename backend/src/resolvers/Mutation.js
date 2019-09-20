// const Mutations = {
//     createDog(parent, args, ctx, info) {
//         global.dogs = global.dogs || []; //defino una variable global que se guarda en la memoria de mi pc, si no existe crea un array vacio
//         // create a dog!
//         const newDog = { name: args.name };
//         global.dogs.push(newDog);
//         return newDog; //devuelvo el nuevo perro pero ya lo tengo almacenado en la memoria
//     }
// };

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Mutations = {
    //createItem tiene que coincidir el nombre con el nombre de la mutation en nuestro schema
    async createItem(parent, args, ctx, info) { //dentro de info me puedo encontrar con la query actual
        // TODO: check if they are logged in

        const item = await ctx.db.mutation.createItem({ //aca se va a ser la conexion con la bd de prisma, y ahora donde esta la api de prisma? -> en prisma.graphql, asique una manera de ver cuales son todos los api methods que disponemos es si buscamos por "type Mutation". Por otro lado ctx.db es la manera de acceder a la bd (esta en el metodo de createServer en createServer.js). Con ctx.db.mutation tenemos acceso a todos los diferentes argumentos que tenemos. Por otro lado ctx.db.mutation.createItem va a devolver una promesa, y si queremos que el valor que devuelve ctx.db.mutation.createItem se almacene en la variable item tenemos que poner "async" en el metodo createItem y await en la creacion del item
            data: {
                // title: args.title,   en lugar de ponerlos asi como todo viene de args pongo directamente spread operator
                // description: args.description
                ...args
            }
        }, info) //pasar info como segundo argumento: va a especificar que data es retornada de la bd cuando creamos el item, en este caso nos va a retornar el item que creamos

        //console.log(item);
        
        return item;
    },
    updateItem(parent, args, ctx, info) {
        //first take a copy of the updates
        const updates = { ...args };
        //remove the ID from the updates: because we dont want to update the id
        delete updates.id;
        //run the update method
        return ctx.db.mutation.updateItem({
            data: updates,
            where: {
                id: args.id
            }
        }, info);
    },
    async deleteItem(parent, args, ctx, info) {
        const where = { id: args.id };
        //1. find the item: la razon de hacer esto es para hacer el paso 2
        const item = await ctx.db.query.item({ where }, `{ id title}`); // ctx.db.query.item() gonna search for an item. Usualmente tambien se le pasa info como segundo parametro, lo que va a hacer es tomar cualquier query de la parte del front end (por ejemplo la de UPDATE_ITEM_MUTATION que esta en UpdateItem.js) y pedir/request que estos campos vuelvan como informacion: id, title, description, price. Sin embargo hay veces que hay un intermediario, tenemos que hacer una segunda query (ctx.db.query) y en ese caso el parametro info no se pasa, sino que pasamos una graphQL query nosotros manualmente. Quiero preguntar por el ID y por el titulo
        //2. check if they own that item, or have the permissions
        //3. Delete it
        return ctx.db.mutation.deleteItem({ where }, info);
    },
    async signup(parent, args, ctx, info) {
        args.email = args.email.toLowerCase();
        //hash their password: never store the users password in the database, for example: dogs123
        const password = await bcrypt.hash(args.password, 10); //await because bcrypt is an asyncronous function, and 10 is the length of the salt, it makes that generated pass unique, osea que no se repetiria el hash aunque en otro site haya un usuario que haya puesto dogs123 tambien.
        //create the user in the database
        const user = await ctx.db.mutation.createUser({
            data: {
                ...args,
                password: password,
                permissions: { set: ['USER'] } // se escribe { set: ['USER'] } porque estamos accediendo a un enum
            }
        }, info); //info so it knows what data to return to the client
        //create the JWT token so after the signup the user is logged-in
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET); //process.env viene del archivo .env
        //(now the user is signed in) we need to set the jwt as a cookie on the response, so that every single time that they click to another page,that token comes alog for the ride.
        ctx.response.cookie('token', token, {
            httpOnly: true, //this will make sure that we cannot access this token via javascript
            maxAge: 1000 * 60 * 60 * 24 * 365 //how long do we want this cookie to last: 1000 miliseconds * 60 seconds in a min * 60 min in an hour * 24 hours in a day * 365 days in a year : it's gonna be 1 year cookie
        });
        //finally we return the user to the browser
        return user;
    },
    async signin(parent, { email, password }, ctx, info) {
        // 1. Check if there is a user with that email
        const user = await ctx.db.query.user({ where: { email } }); // podria hacerlo asi: { where: { email: email }})
        if(!user) {
            throw new Error(`No such user found for email: ${email}`); //this error is gonna be thrown in our query or mutation
        }
        // 2. Check if their password is correct
        const valid = await bcrypt.compare(password, user.password); // bcrypt.compare() returns a promise so we can await it
        if(!valid) {
            throw new Error('Invalid Password!');
        }
        // 3. Generate the JWT
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
        // 4. Set the cookie with the token
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365
        });
        // 5. Return the user
        return user;
    },
    signout(parent, args, ctx, info) {
        ctx.response.clearCookie('token'); //puedo usar este metodo gracias al cookieParser que declaramos
        return { message: 'Goodbye!'};
    }
};

module.exports = Mutations;
