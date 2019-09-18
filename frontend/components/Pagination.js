import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import Head from 'next/head';
import Link from 'next/link';
import PaginationStyles from './styles/PaginationStyles';
import { perPage } from '../config';

const PAGINATION_QUERY = gql`
    query PAGINATION_QUERY {
        itemsConnection {
            aggregate {
                count
            }
        }
    }
`;

const Pagination = props => (
    <Query query={PAGINATION_QUERY}>
        {({ data, loading, error }) => {
            if(loading) return <p>Loading...</p>;
            const count = data.itemsConnection.aggregate.count;
            const pages = Math.ceil(count / perPage);
            const page = props.page;
            return (
                <PaginationStyles>
                    <Head>
                        <title>Sick Fits! - Page {page} of {pages}</title>
                    </Head>
                    <Link
                        prefetch //in production it's gonna go off and pre-render both the previous and the forward looking page, so that you are always pre-loading the next and the previous one, so that when you hit your Pagination it's going to be absolutely instant. This prefetch does not work in development mode. Se puede poner en cualquier <Link>
                        href={{
                            pathname: 'items',
                            query: { page: page - 1 }
                        }}
                    >
                        <a className="prev" aria-disabled={page <= 1}>Prev</a>
                    </Link>
                    <p>Page {page} of {pages}</p>
                    <p>{count} Items Total</p>
                    <Link
                        prefetch
                        href={{
                            pathname: 'items',
                            query: { page: page + 1 }
                        }}
                    >
                        <a className="next" aria-disabled={page >= pages}>Next</a>
                    </Link>
                </PaginationStyles>
            );
        }}
    </Query>
);

export default Pagination;