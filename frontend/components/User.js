//this is a Render Prop component, por ejemplo lo uso en Nav.js
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import PropTypes from 'prop-types';

const CURRENT_USER_QUERY = gql`
    query {
        me {
            id
            email
            name
            permissions
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