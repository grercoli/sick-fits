const { GraphQLServer } = require('graphql-yoga');
// then we need to import our resolvers, they answer the question: where does this data come from? or what does this data do in the database?
// There are 2 different resolvers: query resolvers (when you pull data) and mutation resolvers (when you push data)
const Mutation = require('./resolvers/Mutation');
const Query = require('./resolvers/Query');
const db = require('./db');

// Create the GraphQL Yoga server

function createServer() {
    return new GraphQLServer({
        typeDefs: 'src/schema.graphql',
        resolvers: {
            Mutation, //es lo mismo que Mutation: Mutation
            Query
        },
        resolverValidationOptions: {
            requireResolversForResolveType: false
        },
        context: req => ({ ...req, db }) //we need to be able to access the database from the resolvers, and the way that you can pass that is via context. So we want to surface this database on every single request. Comebacks will also give us the rest of the request as well (...req), so if we need any request information about the incoming request whether that's headers, or cookies, or anything that's coming in that will be available on the context request.
    });
}

module.exports = createServer;