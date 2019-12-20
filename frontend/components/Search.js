import React from 'react';
import Downshift, { resetIdCounter } from 'downshift';
import Router from 'next/router'; //allow us to change the page
import { ApolloConsumer } from 'react-apollo'; //allow us to run these queries on demand and not on page load with a regular query or a mutation
import gql from 'graphql-tag';
import debounce from 'lodash.debounce'; // Para evitar que por cada palabra que ingrese en el input del autocomplete searchForm dispare una llamada a la query (y a la base de datos) uso el debounce. Debounce: it will take all of those events that are fired within a range of time, for example 350ms (osea el tiempo que da de espera). So it will make sure that we are not unnecessarily firing off on every key up
import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown';

//OR is an array and you can give a bunch of objects. Quiere decir que puede estar en el titulo o en la descripcion (it will say find me items where one of these is true). El contains puedo verlo o sacarlo del archivo generado por prisma
const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(where: { 
        OR: [{ title_contains: $searchTerm }, { description_contains: $searchTerm }] 
    }) {
      id
      image
      title
    }
  }
`;

function routeToItem(item) {
  Router.push({
    pathname: '/item',
    query: {
      id: item.id,
    },
  });
}

class AutoComplete extends React.Component {
  state = {
    items: [],
    loading: false,
  };
  onChange = debounce(async (e, client) => {
    console.log('Searching...');
    // turn loading on
    this.setState({ loading: true });
    // Manually query apollo client
    const res = await client.query({ // fire the query that's why there is an await
      query: SEARCH_ITEMS_QUERY,
      variables: { searchTerm: e.target.value }, // the variables that we gonna pass: e.target.value is what comes from the input
    });
    this.setState({ // put the items I receive into the state
      items: res.data.items,
      loading: false,
    });
  }, 350); // el tiempo que da de espera, en ms
  render() {
    resetIdCounter();
    return (
      <SearchStyles>
        <Downshift onChange={routeToItem} itemToString={item => (item === null ? '' : item.title)}>
          {({ getInputProps, getItemProps, isOpen, inputValue, highlightedIndex }) => (
            <div>
              <ApolloConsumer>
                {client => ( // (client) => () run a render prop
                  <input
                    {...getInputProps({
                      type: 'search',
                      placeholder: 'Search For An Item',
                      id: 'search',
                      className: this.state.loading ? 'loading' : '',
                      onChange: e => {
                        e.persist();
                        this.onChange(e, client);
                      },
                    })}
                  />
                )}
              </ApolloConsumer>
              {isOpen && (
                <DropDown> 
                  {this.state.items.map((item, index) => (
                    <DropDownItem
                      {...getItemProps({ item })}
                      key={item.id}
                      highlighted={index === highlightedIndex}
                    >
                      <img width="50" src={item.image} alt={item.title} />
                      {item.title}
                    </DropDownItem>
                  ))}
                  {!this.state.items.length &&
                    !this.state.loading && <DropDownItem> Nothing Found {inputValue}</DropDownItem>}
                </DropDown>
              )}
            </div>
          )}
        </Downshift>
      </SearchStyles>
    );
  }
}

export default AutoComplete;