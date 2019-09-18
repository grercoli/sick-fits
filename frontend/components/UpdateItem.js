import React, { Component } from 'react';
import { Mutation, Query } from 'react-apollo'; //allow us to push data
import gql from 'graphql-tag';
import Router from 'next/router';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';

const SINGLE_ITEM_QUERY = gql`
    query SINGLE_ITEM_QUERY($id: ID!) {
        item(where: { id: $id }) {
            id
            title
            description
            price
        }
    }
`;

const UPDATE_ITEM_MUTATION = gql`
    mutation UPDATE_ITEM_MUTATION(
        $id: ID!
        $title: String
        $description: String
        $price: Int
    ) {
        updateItem(
            id: $id
            title: $title
            description: $description
            price: $price
        ) {
            id
            title
            description
            price
        }
    }
`; //export it because it will be usefull for tests and for sharing it to other components. El createItem viene del backend de schema.graphql donde puedo ver que parametros tiene. En el CREATE_ITEM_MUTATION puedo pasarle argumentos definiendoles el tipo, y despues puedo asignarles esas variables en el metodo createItem usando un $ . Luego retorno el id

class UpdateItem extends Component {
    state = {
    };

    handleChange = event => {
        const { name, type, value } = event.target;

        const val = type === 'number' ? parseFloat(value) : value;

        this.setState({ [name]: val }); //we can use computed property names: where we can set the name of it [name] and that's going to be title: val, price: val, description: val
    };

    updateItem = async (e, updateItemMutation) => {
        e.preventDefault();
        //call the mutation
        const res = await updateItemMutation({
            variables: { //le paso los valores a la funcion para que pueda actualizarlos, a través de "variables"
                id: this.props.id,
                ...this.state
            }
        });
    }

    render() {
        return (
            <Query query={SINGLE_ITEM_QUERY} variables={{
                id: this.props.id
            }}>
                {({data, loading}) => {
                    if (loading) return <p>Loading...</p>;
                    if (!data.item) return <p>No Item Found for ID: {this.props.id}</p>;
                    return (
                        // cuando se dispara Mutation a traves de variables={this.state} le paso a CREATE_ITEM_MUTATION las propiedades que tengo en el state
                        // el unico hijo de una mutation es una funcion, justo al igual que query
                        <Mutation mutation={UPDATE_ITEM_MUTATION} variables={this.state}>
                            {(updateItem, { loading, error }) => ( // me trae dos argumentos: (mutationfunction y payload), pero el primero puedo nombrarlo al igual que esta arriba como createItem (como esta en el server). Para el payload puedo aplicarle destructuring { loading, error, called, data }. Call will give me a boolean if it's been run or not and data will give the data that actually comes back
                                <Form onSubmit={ e => this.updateItem(e, updateItem) }>
                                    <Error error={error} />
                                    <h2>Update an Item.</h2>
                                    <fieldset disabled={loading} aria-busy={loading}>
                                        <label htmlFor="title">
                                            Title
                                            <input 
                                                type="text"
                                                id="title"
                                                name="title"
                                                placeholder="Title"
                                                required
                                                defaultValue={data.item.title} //defaultValue permite que el texto no dependa del state: this.state.title. En otras palabras no va a mostrar lo que hay en el state pero si actualizo el texto se guarda en el state
                                                onChange={this.handleChange}
                                            />
                                        </label>

                                        <label htmlFor="price">
                                            Price
                                            <input 
                                                type="number"
                                                id="price"
                                                name="price"
                                                placeholder="Price"
                                                required
                                                defaultValue={data.item.price}
                                                onChange={this.handleChange}
                                            />
                                        </label>

                                        <label htmlFor="description">
                                            Description
                                            <textarea 
                                                id="description"
                                                name="description"
                                                placeholder="Enter A Description"
                                                required
                                                defaultValue={data.item.description}
                                                onChange={this.handleChange}
                                            />
                                        </label>

                                        <button type="submit">Sav{loading ? 'ing' : 'e'} Changes</button>
                                    </fieldset>
                                </Form>
                            )}
                        </Mutation>
                    )
                }}
            </Query>
        )
    }
}

export default UpdateItem;
export { UPDATE_ITEM_MUTATION }; 