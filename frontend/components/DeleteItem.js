import React, { Component } from 'react'
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { ALL_ITEMS_QUERY } from './Items';

const DELETE_ITEM_MUTATION = gql`
    mutation DELETE_ITEM_MUTATION($id: ID!) {
        deleteItem(id: $id) {
            id
        }
    }
`;

class DeleteItem extends Component {
    update = (cache, payload) => { //Apollo will give me 2 parameters when the update happens: access to the cache and to the payload (data that has come back from the item that got deleted)
        //manually update the cache on the client, so it matches the server
        //1. read the cache for the items we want: para ver que hay lo puedo hacer con la extension de Apollo en chrome
        const data = cache.readQuery({ query: ALL_ITEMS_QUERY }); //accede a todos los items que esta en la pagina para ese cache (inclusive con el item que di en eliminar)
        //2. filter the deleted item out of the page
        data.items = data.items.filter(item => item.id !== payload.data.deleteItem.id); //only include it if it doesnt match the deleted one
        //3. put the items back
        cache.writeQuery({ query: ALL_ITEMS_QUERY, data: data }); // data: data es lo mismo que poner data solamente
    }

    render() {
        return (
            // le pasamos el id en "variables" para saber que item vamos a borrar
            <Mutation 
                mutation={DELETE_ITEM_MUTATION} 
                variables={{id: this.props.id}}
                update={this.update}
            >
                {(deleteItem, {error}) => (
                    <button 
                        onClick={() => {
                            if(confirm('Are you sure you want to delete this item?')) {
                                deleteItem().catch(err => {
                                    alert(err.message);
                                }); //deleteItem is a promise and if you want catch errors of that promise you simply put .catch
                            }
                        }}
                    >
                        {this.props.children}
                    </button>
                )} 
            </Mutation>
        );
    }
}

export default DeleteItem;