import React from 'react';
import { Mutation } from 'react-apollo';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { CURRENT_USER_QUERY } from './User';

//the reason we asked for the id is so we can remove it from the cache and this is done with an update method on our mutation
const REMOVE_FROM_CART_MUTATION = gql`
  mutation removeFromCart($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`;

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover {
    color: ${props => props.theme.red};
    cursor: pointer;
  }
`;

class RemoveFromCart extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
  };
  // This gets called as soon as we get a response back from the server after a mutation has been performed
  update = (cache, payload) => { //the cache is the Apollo cache and payload is the info that returns from the server once is done, so it gonna contains the id that results from the mutation above (removeFromCart)
    // 1. first read the cache
    const data = cache.readQuery({ query: CURRENT_USER_QUERY });
    // 2. remove that item from the cart
    const cartItemId = payload.data.removeFromCart.id;
    data.me.cart = data.me.cart.filter(cartItem => cartItem.id !== cartItemId); //we are going to filter out if it has that id
    // 3. write it back to the cache
    cache.writeQuery({ query: CURRENT_USER_QUERY, data });
  };
  render() {
    return (
      <Mutation
        mutation={REMOVE_FROM_CART_MUTATION}
        variables={{ id: this.props.id }}
        update={this.update}
        optimisticResponse={{ //is for run the update function above inmediatelly
          __typename: 'Mutation', //we asume its going to return a mutation and inside of the mutation we have the removeFromCart
          removeFromCart: {
            __typename: 'CartItem',
            id: this.props.id, //we are going to assume that its going to return an id with the item that was removed
          },
        }} // what is going to happen is that when we actually delete the item its gonna optimistically, inmediately reply with this piece of information, and then in the background, it's going to go ahead and remove it
      >
        {(removeFromCart, { loading, error }) => (
          <BigButton
            disabled={loading}
            onClick={() => {
              removeFromCart().catch(err => alert(err.message));
            }}
            title="Delete Item"
          >
            &times;
          </BigButton>
        )}
      </Mutation>
    );
  }
}

export default RemoveFromCart;
export { REMOVE_FROM_CART_MUTATION };