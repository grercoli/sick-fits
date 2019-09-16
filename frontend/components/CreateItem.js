import React, { Component } from 'react';
import { Mutation } from 'react-apollo'; //allow us to push data
import gql from 'graphql-tag';
import Router from 'next/router';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';

const CREATE_ITEM_MUTATION = gql`
    mutation CREATE_ITEM_MUTATION(
        $title: String!
        $description: String!
        $price: Int!
        $image: String
        $largeImage: String
    ) {
        createItem(
            title: $title
            description: $description
            price: $price
            image: $image
            largeImage: $largeImage
        ) {
            id
        }
    }
`; //export it because it will be usefull for tests and for sharing it to other components. El createItem viene del backend de schema.graphql donde puedo ver que parametros tiene. En el CREATE_ITEM_MUTATION puedo pasarle argumentos definiendoles el tipo, y despues puedo asignarles esas variables en el metodo createItem usando un $ . Luego retorno el id

class CreateItem extends Component {
    state = {
        title: '',
        description: '',
        image: '',
        largeImage: '',
        price: 0,
    };

    handleChange = event => {
        const { name, type, value } = event.target;

        const val = type === 'number' ? parseFloat(value) : value;

        this.setState({ [name]: val }); //we can use computed property names: where we can set the name of it [name] and that's going to be title: val, price: val, description: val
    };

    uploadFile = async e => {
        //pull the files out of that selection
        const files = e.target.files;
        //then we use the form data API (it's part of Javascript language)
        const data = new FormData();
        data.append('file', files[0]);
        //add the upload preset
        data.append('upload_preset', 'sickfits');
        //hit the Cloudinary API
        const res = await fetch('https://api.cloudinary.com/v1_1/dt3zonghz/image/upload', {
            method: 'POST',
            body: data
        });
        //upload that and we are going to parse the data that comes back. Convert the response that we get into json
        //the eager is a secondary transformed that happens and its gonna transform a larger version
        const file = await res.json();
        console.log(file);
        this.setState({
            image: file.secure_url,
            largeImage: file.eager[0].secure_url
        });
    };

    render() {
        return (
            // cuando se dispara Mutation a traves de variables={this.state} le paso a CREATE_ITEM_MUTATION las propiedades que tengo en el state
            // el unico hijo de una mutation es una funcion, justo al igual que query
            <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
                {(createItem, { loading, error }) => ( // me trae dos argumentos: (mutationfunction y payload), pero el primero puedo nombrarlo al igual que esta arriba como createItem (como esta en el server). Para el payload puedo aplicarle destructuring { loading, error, called, data }. Call will give me a boolean if it's been run or not and data will give the data that actually comes back
                    <Form 
                        onSubmit={async e => {
                            e.preventDefault();
                            //call the mutation
                            const res = await createItem();
                            //change them to the single item page
                            Router.push({
                                pathname: '/item',
                                query: { id: res.data.createItem.id }
                            });
                        }}
                    >
                        <Error error={error} />
                        <h2>Sell an Item.</h2>
                        <fieldset disabled={loading} aria-busy={loading}>
                            <label htmlFor="file">
                                Image
                                <input 
                                    type="file"
                                    id="file"
                                    name="file"
                                    placeholder="Upload an image"
                                    required
                                    onChange={this.uploadFile}
                                />
                                {this.state.image && <img width="200" src={this.state.image} alt="Upload Preview" />}
                            </label>

                            <label htmlFor="title">
                                Title
                                <input 
                                    type="text"
                                    id="title"
                                    name="title"
                                    placeholder="Title"
                                    required
                                    value={this.state.title}
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
                                    value={this.state.price}
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
                                    value={this.state.description}
                                    onChange={this.handleChange}
                                />
                            </label>

                            <button type="submit">Submit</button>
                        </fieldset>
                    </Form>
                )}
            </Mutation>
        )
    }
}

export default CreateItem;
export { CREATE_ITEM_MUTATION }; 