// This is the component for just fetching and looping over the items, then we would want to create a new componente named "Item" that's going to do the heavy lifting of rendering that out.

import React, { Component } from 'react';
import { Query } from 'react-apollo'; //allow us to actually query data directly into this component
import gql from 'graphql-tag'; //allow us to write querys
import styled from 'styled-components';
import Item from './Item';

const ALL_ITEMS_QUERY = gql`
    query ALL_ITEMS_QUERY {
        items {
            id
            title
            price
            description
            image
            largeImage
        }
    }
`; //best practice: poner las querys en mayusculas. Escribir la query como si estuvieramos en el playground

const Center = styled.div`
    text-align: center;
`;

const ItemsList = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 60px;
    max-width: ${props => props.theme.maxWidth};
    margin: 0 auto;
`;

class Items extends Component {
    render() {
        return (
            <Center>
                <Query query={ALL_ITEMS_QUERY}>
                    {({ data, error, loading }) => {
                        if (loading) return <p>Loading...</p>;
                        if (error) return <p>Error: {error.message}</p>;
                        return (
                            <ItemsList>
                                {data.items.map(item => (
                                    <Item item={item} key={item.id} />
                                ))}
                            </ItemsList>
                        );
                    }}
                </Query>
            </Center>
        )
    }
}

export default Items;
export { ALL_ITEMS_QUERY };

// Render Prop: you simply just put a component inside of
{/* <div>
    <p>Items!</p>
</div> */}
// that is a query and then the child of that component is going to be a function that gives you either loading state, an error or the actual list of items itself
// the only child of a query component must be a function
{/* <Query query={ALL_ITEMS_QUERY}>
    {(payload) => { //the arrow function gives us a payload, that contains the information and important methods. I also can destructure it to dont do payload.data, payload.error...etc
        console.log(payload);
        return <p>Hey I found: {payload.data.items.length}</p> Then i need to return a JSX
    }}
</Query> */}