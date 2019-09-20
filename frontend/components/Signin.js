import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';

const SIGNIN_MUTATION = gql`
    mutation SIGNIN_MUTATION($email: String!, $password: String!) {
        signin(email: $email, password: $password) {
            id
            email
            name
        }
    }
`;

class Signin extends Component {
    state = {
        name: '',
        password: '',
        email: ''
    }

    saveToState = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    render() {
        return (
            <Mutation // una vez que esta mutation sea successful lo que va a hacer es ir por el refetch
                mutation={SIGNIN_MUTATION} 
                variables={this.state}
                refetchQueries={[
                    { query: CURRENT_USER_QUERY } // si tuviera variables podria pasarlas tambien { query: CURRENT_USER_QUERY, variables: .. }
                ]} //sirve para que cuando un usuario se loguee de la sensacion como que se refresca la pagina pero lo unico que hace es volver a hacer una llamada a las queries que establezco 
            >
                {(signin, { error, loading }) => (
                    <Form method="post" onSubmit={async e => {
                        e.preventDefault();
                        await signin(); //const res = await signin(); capture the response of the signin, works for example if i want to give a success message to the user
                        this.setState({ name: '', email: '', password: '' });
                    }}>
                        <fieldset disabled={loading} aria-busy={loading}>
                            <h2>Sign Into Your Account</h2>
                            <Error error={error} />
                            <label htmlFor="email">
                                Email
                                <input type="email" name="email" placeholder="Your Email" value={this.state.email} onChange={this.saveToState}/>
                            </label>
                            <label htmlFor="password">
                                Password
                                <input type="password" name="password" placeholder="Choose a password" value={this.state.password} onChange={this.saveToState}/>
                            </label>
                            <button type="submit">Sign In!</button>
                        </fieldset>
                    </Form>
                )}
            </Mutation>
        )
    }
}

export default Signin;