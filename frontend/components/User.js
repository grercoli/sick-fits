//this is a Render Prop component, por ejemplo lo uso en Nav.js
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import PropTypes from 'prop-types';

//inside of the cart its gonna be many cart items. So each cartItem will have an ID and a quantity
const CURRENT_USER_QUERY = gql`
    query {
        me {
            id
            email
            name
            permissions
            cart {
                id
                quantity
                item {
                    id
                    price
                    image
                    title
                    description
                }
            }
        }
    }
`;

const User = props => (
    <Query {...props} query={CURRENT_USER_QUERY}>
        {/* le paso al hijo el payload. Me va a permitir no tener que volver a escribir la query */}
        {payload => props.children(payload)}
    </Query>
);

User.propTypes = {
    children: PropTypes.func.isRequired
}

export default User;
export { CURRENT_USER_QUERY };