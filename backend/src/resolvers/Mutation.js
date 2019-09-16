// const Mutations = {
//     createDog(parent, args, ctx, info) {
//         global.dogs = global.dogs || []; //defino una variable global que se guarda en la memoria de mi pc, si no existe crea un array vacio
//         // create a dog!
//         const newDog = { name: args.name };
//         global.dogs.push(newDog);
//         return newDog; //devuelvo el nuevo perro pero ya lo tengo almacenado en la memoria
//     }
// };

const Mutations = {
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
    }
};

module.exports = Mutations;
