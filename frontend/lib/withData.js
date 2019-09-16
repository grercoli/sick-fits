import withApollo from 'next-with-apollo'; //will expose our Apollo Client via a prop
import ApolloClient from 'apollo-boost'; //(Apollo Client is like the database that is in the client)
import { endpoint } from '../config'; //Yoga API endpoint

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
  });
}

export default withApollo(createClient);
