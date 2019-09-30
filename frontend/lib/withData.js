import withApollo from 'next-with-apollo'; //will expose our Apollo Client via a prop
import ApolloClient from 'apollo-boost'; //(Apollo Client is like the database that is in the client)
import { endpoint } from '../config'; //Yoga API endpoint
import { LOCAL_STATE_QUERY } from '../components/Cart';

function createClient({ headers }) { //los headers son muy importantes cuando entremos con autenticacion
  return new ApolloClient({
    uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint, //we give the url of our endpoint
    request: operation => { //means on every single request that happens, this is sort of like an express middleware
      operation.setContext({
        fetchOptions: {
          credentials: 'include', //when you make a request if we have any logged in cookies in the browser, then those cookies are gonna come along for the ride and that's important when we flip over to our back end
        },
        headers,
      });
    },
    //local data
    clientState: {
      resolvers: {
        Mutation: {
          toggleCart(_, variables, { cache }) { //first an _ that doesnt matter, then the variables that come along with the request, and then third you get the Apollo Client (_, variables, client) but we dont want the client so we are going to destructure it
            // 1. Read the cartOpen value from the cache
            const { cartOpen } = cache.readQuery({
              query: LOCAL_STATE_QUERY
            });
            // 2. Write the cart state to the opposite
            const data = {
              data: { cartOpen: !cartOpen }
            };
            cache.writeData(data);
          }
        }
      }, //takes resolver for our mutations
      defaults: {
        cartOpen: true
      } //for the data when it loads (its the same when a componente loads for the first time and the initial state is initialized)
    }
  });
}

export default withApollo(createClient);
