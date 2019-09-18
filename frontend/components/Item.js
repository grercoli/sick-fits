import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import Title from './styles/Title';
import ItemStyles from './styles/ItemStyles';
import PriceTag from './styles/PriceTag';
import formatMoney from '../lib/formatMoney';
import DeleteItem from './DeleteItem';

class Item extends Component {
    render() {
        const { item } = this.props;
        return (
            <ItemStyles>
                {item.image && <img src={item.image} alt={item.title} />}
                <Title>
                    {/* in jsx if you want to pass reference to something like you had a variable it would be href={item} but if its an object it has to be href={{}} */}
                    <Link href={{
                        pathname: '/item', //when someone clicks thats where the user go
                        query: { id: item.id } //the query that comes along with that path like the URL, the ?
                    }}>
                        <a>{item.title}</a>
                    </Link>
                </Title>
                <PriceTag>{formatMoney(item.price)}</PriceTag>
                <p>{item.description}</p>

                <div className="buttonList">
                    <Link href={{
                        pathname: '/update',
                        query: { id: item.id }
                    }}>
                        <a>Edit</a>
                    </Link>
                    <button>Add To Cart</button>
                    <DeleteItem id={item.id}>Delete Item</DeleteItem>
                </div>
            </ItemStyles>
        );
    }
}

Item.propTypes = {
    item: PropTypes.object.isRequired //en lugar de object podria usar shape() para ser mas especifico con lo que contiene
    // item: PropTypes.shape({
    //     title: PropTypes.string.isRequired,
    //     price: propTypes.number.isRequired
    // })
};

export default Item;