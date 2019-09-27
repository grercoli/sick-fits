import React from 'react'
import App from 'next/app'
import Page from '../components/Page';
import { ApolloProvider } from 'react-apollo';
import withData from '../lib/withData';

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) { //is going to pass us the component and the context. Mas que nada para cuando tengo diferentes paginas en la aplicacion, i will need to surface those page values, por ejemplo cuando tenga /items?page=1 or page=2... 
    let pageProps = {};
    if(Component.getInitialProps) { //if the component that we are trying to render has some props, then we are going to surface those via the page props
      pageProps = await Component.getInitialProps(ctx); //what i say is every single page that we have its going to crawl the entire page for any queries or mutations that we have inside of that page that need to be fetched (for example a list of items or a shopping cart)
    }
    // this exposes the query to the user
    pageProps.query = ctx.query;
    return { pageProps };
  }

  render() {
    const { Component, pageProps, apollo } = this.props
    return (
        <ApolloProvider client={apollo}>
          <Page>
              <Component {...pageProps} />
              {/* {console.log(pageProps)} */}
          </Page>
        </ApolloProvider>
    );
  }
}

export default withData(MyApp);