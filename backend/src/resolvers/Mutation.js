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
const { randomBytes } = require('crypto'); //it works via a callback function
const { promisify } = require('util'); //it will take callback based functions and turn them into promised based functions
const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');

const Mutations = {
    //createItem tiene que coincidir el nombre con el nombre de la mutation en nuestro schema
    async createItem(parent, args, ctx, info) { //dentro de info me puedo encontrar con la query actual
        // Check if they are logged in (in the backend)
        if(!ctx.request.userId) {
            throw new Error('You must be logged in to do that!');
        }

        const item = await ctx.db.mutation.createItem({ //aca se va a ser la conexion con la bd de prisma, y ahora donde esta la api de prisma? -> en prisma.graphql, asique una manera de ver cuales son todos los api methods que disponemos es si buscamos por "type Mutation". Por otro lado ctx.db es la manera de acceder a la bd (esta en el metodo de createServer en createServer.js). Con ctx.db.mutation tenemos acceso a todos los diferentes argumentos que tenemos. Por otro lado ctx.db.mutation.createItem va a devolver una promesa, y si queremos que el valor que devuelve ctx.db.mutation.createItem se almacene en la variable item tenemos que poner "async" en el metodo createItem y await en la creacion del item
            data: {
                // title: args.title,   en lugar de ponerlos asi como todo viene de args pongo directamente spread operator
                // description: args.description
                ...args,
                user: { // this is how to create a relationship between the item and the user
                    connect: {
                        id: ctx.request.userId
                    }
                }
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
        const item = await ctx.db.query.item({ where }, `{ id title user { id }}`); // ctx.db.query.item() gonna search for an item. Usualmente tambien se le pasa info como segundo parametro, lo que va a hacer es tomar cualquier query de la parte del front end (por ejemplo la de UPDATE_ITEM_MUTATION que esta en UpdateItem.js) y pedir/request que estos campos vuelvan como informacion: id, title, description, price. Sin embargo hay veces que hay un intermediario, tenemos que hacer una segunda query (ctx.db.query) y en ese caso el parametro info no se pasa, sino que pasamos una graphQL query nosotros manualmente. Quiero preguntar por el ID, por el titulo y por el usuario (y del usuario quiero el id)
        //2. check if they own that item, or have the permissions
        const ownsItem = item.user.id === ctx.request.userId;
        const hasPermissions = ctx.request.user.permissions.some(permission => ['ADMIN', 'ITEMDELETE'].includes(permission));

        if(!ownsItem && !hasPermissions) {
            throw new Error("You don't have permission to do that!");
        }

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
    },
    async requestReset(parent, args, ctx, info) {
        // 1. Check if this is a real user
        const user = await ctx.db.query.user({ where: { email: args.email }});
        if(!user) {
            throw new Error(`No such user found for email: ${args.email}`);
        }
        // 2. Set a reset token and expiry on that user
        const randomBytesPromisified = promisify(randomBytes);
        const resetToken = (await randomBytesPromisified(20)).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // that is 1 hour from now
        const res = await ctx.db.mutation.updateUser({
            where: { email: args.email },
            data: { resetToken, resetTokenExpiry } //la data que mandamos para actualizar. Es lo mismo poner: resetToken: resetToken, resetTokenExpiry: resetTokenExpiry
        });
        // 3. Email them that reset token
        const mailRes = await transport.sendMail({ //se puede envolver esto en un try y catch por si llega a tirar algun error y asi poder notificarselo al usuario
            from: 'test@test.com',
            to: user.email,
            subject: 'Your Password Reset',
            html: makeANiceEmail(`Your Password Reset Token is here! \n\n <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here To Reset</a>`) // \n is new line
        });
        // 4. Return the message
        return { message: 'Thanks!' };
    },
    async resetPassword(parent, args, ctx, info) {
        // 1. Check if the passwords match (server-side)
        if(args.password !== args.confirmPassword) {
            throw new Error('Your passwords don\'t match!');
        }
        // 2 & 3 Check if it's a legit reset token / Check if it's expired
        const [user] = await ctx.db.query.users({
            where: {
                // lo primero que va a ser es primero buscar por alguien que tenga el resetToken pero tambien va a chequear que ese token este todavia dentro del tiempo de una hora como limite. Si matchea resetToken pero no resetTokenExpiry_gte no va a devolver nada
                resetToken: args.resetToken,
                resetTokenExpiry_gte: Date.now() - 3600000//_gte significa is greater or equal to
            }
        }); // we get an array and then we can destructure the first item into a variable called user. [user] significa grab the first user where we search for users y despues lo especificas con el where
        if(!user) {
            throw new Error('This token is either invalid or expired!');
        }
        // 4. Hash their new password
        const password = await bcrypt.hash(args.password, 10);
        // 5. Save the new password to the user and remove old resetToken fields
        const updatedUser = await ctx.db.mutation.updateUser({
            where: { email: user.email },
            data: {
                password,
                resetToken: null,
                resetTokenExpiry: null
            }
        });
        // 6. Generate JWT
        const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
        // 7. Set the JWT cookie
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365
        });
        // 8. Return the new user
        return updatedUser;
    },
    async updatePermissions(parent, args, ctx, info) {
        // 1. Check if they are logged in
        if(!ctx.request.userId) { //como se repite varias veces en varios lados puedo crear una funcion para esto
            throw new Error('You must be logged in!');
        }
        // 2. Query the current user
        const currentUser = await ctx.db.query.user({
            where: {
                id: ctx.request.userId
            }
        }, info);
        // 3. Check if they have permissions to do this
        hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
        // 4. Update the permissions
        return ctx.db.mutation.updateUser({
            data: {
                permissions: {
                    set: args.permissions
                }
            }, //data that need to be updated
            where: {
                id: args.userId // we might be updating someone else user not mine so that's why i dont use currentUser
            }
        }, info);
    },
    async addToCart(parent, args, ctx, info) {
        // 1. Make sure they are signed in
        const { userId } = ctx.request;
        if(!userId) {
            throw new Error('You must be signed in soon');
        }
        // 2. Query the users current cart: its for multiple items
        // si me tira un error: ctx.db.querycartItems is not a function or its return value its not iterable es porque es una promise y no puse el await
        const [existingCartItem] = await ctx.db.query.cartItems({ //we are going to destructure the first element that is returned into a variable called existingCartItem. It's cartItems (not cartItem) because we want to query it based on both the "users id", as well as the "item id" that they are trying to put in. So we want to know, has this user put this item into their cart before, and if this user has not put this item into their cart before, then we are gonna make a new one. And if I were just to use cartItem just to query one, it wouldnt work.
            where: {
                user: { id: userId },
                item: { id: args.id }
            }
        });
        // 3. Check if that item is already in their cart and increment by 1 if it is
        if(existingCartItem) {
            return ctx.db.mutation.updateCartItem({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + 1 }
            }, info);
        }
        // 4. If its not, create a fresh CartItem for that user
        return ctx.db.mutation.createCartItem({ // a cartItem is just a pointer at who has it and item is it
            data: {
                user: {
                    connect: { id: userId } //asi se hacen las relationships (con el connect)
                },
                item: {
                    connect: { id: args.id }
                }
            }
        }, info);
    },
    async removeFromCart(parent, args, ctx, info) {
        // 1.Find the cart item
        const cartItem = await ctx.db.query.cartItem(
            {
              where: {
                id: args.id,
              },
            },
            `{ id, user { id }}`
          ); //We need to know who owns the cart item. Instead of passing info I pass { id, user { id }} because our final query is not going to ask for the user, we just need the ID. So: { id, user { id }} we want the id of the cart item, we also want the user of the cart item along with the user's ID.
        // 1.5 Make sure we found an item
        if (!cartItem) throw new Error('No CartItem Found!');
        // 2. Make sure they own that cart item
        if (cartItem.user.id !== ctx.request.userId) {
            throw new Error('Cheatin huhhhh');
        }
        // 3. Delete that cart item
        return ctx.db.mutation.deleteCartItem({
            where: { id: args.id },
        }, info);
    }
};

module.exports = Mutations;
