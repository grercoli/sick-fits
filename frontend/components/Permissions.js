import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import Error from './ErrorMessage';
import Table from './styles/Table';
import SickButton from './styles/SickButton';

const possiblePermissions = [
    'ADMIN',
    'USER',
    'ITEMCREATE',
    'ITEMUPDATE',
    'ITEMDELETE',
    'PERMISSIONUPDATE'
];

const UPDATE_PERMISSIONS_MUTATION = gql`
    mutation updatePermissions($permissions: [Permission], $userId: ID!) {
        updatePermissions(permissions: $permissions, userId: $userId) {
            id
            permissions
            name
            email
        }
    }
`;

const ALL_USERS_QUERY = gql`
    query {
        users {
            id
            name
            email
            permissions
        }
    }
`;

const Permissions = props => (
    <Query query={ALL_USERS_QUERY}>
        {({ data, loading, error }) => (
            <div>
                <Error error={error} />
                <h2>Manage Permissions</h2>
                <Table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            {possiblePermissions.map(permission => <th key={permission}>{permission}</th>)}
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.users.map(user => <UserPermissions user={user} key={user.id} />)}
                    </tbody>
                </Table>
            </div>
        )}
    </Query>
);

class UserPermissions extends React.Component {
    static propTypes = {
        user: PropTypes.shape({
            name: PropTypes.string,
            email: PropTypes.string,
            id: PropTypes.string,
            permissions: PropTypes.array
        }).isRequired
    };

    state = {
        permissions: this.props.user.permissions // no es recomendable inicializar el state con las props para muchos casos, pero en este caso si sirve
    };

    handlePermissionChange = (e) => {
        const checkbox = e.target;
        // take a copy of the current permissions
        let updatedPermissions = [...this.state.permissions];
        // figure out if we need to remove or add this permission
        if(checkbox.checked) {
            // add it in!
            updatedPermissions.push(checkbox.value);
        } else {
            // loop over current permissions and remove that one from the updated permissions
            // we only want to filter if it is does not equal to the current checkbox values
            // if we have an array with ADMIN and USER and the one we unchecked was ADMIN its going to say: if it is admin take it away from the array
            updatedPermissions = updatedPermissions.filter(permission => permission !== checkbox.value);
        }
        this.setState({ permissions: updatedPermissions});
    }

    render() {
        const user = this.props.user;
        return (
            <Mutation mutation={UPDATE_PERMISSIONS_MUTATION} variables={{
                permissions: this.state.permissions,
                userId: this.props.user.id
            }}>
                {(updatePermissions, { loading, error }) => (
                    <>
                        {error && <tr><td colspan="8"><Error error={error} /></td></tr>}
                        <tr>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            {possiblePermissions.map(permission => (
                                <td key={permission}>
                                    <label htmlFor={`${user.id}-permission-${permission}`}>
                                        <input 
                                            id={`${user.id}-permission-${permission}`}
                                            type="checkbox"
                                            checked={this.state.permissions.includes(permission) ? true : false}
                                            value={permission}
                                            onChange={this.handlePermissionChange}
                                        />
                                    </label>
                                </td>
                            ))}
                            <td>
                                <SickButton
                                    type="button"
                                    disabled={loading}
                                    onClick={updatePermissions}
                                >
                                    Updat{loading ? 'ing' : 'e'}
                                </SickButton>
                            </td>
                        </tr>
                    </>
                )}
            </Mutation>
        );
    }
}

export default Permissions;