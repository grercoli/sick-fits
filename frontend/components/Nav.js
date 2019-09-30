import Link from 'next/link';
import { Mutation } from 'react-apollo';
import { TOGGLE_CART_MUTATION } from './Cart';
import NavStyles from './styles/NavStyles';
import User from './User';
import Signout from './Signout';
import CartCount from './CartCount';

const Nav = () => (
    <User>
        {({data: { me } }) => ( //tenemos un payload, pero lo vamos a destructurar en data y despues lo destructuro en "me"
            <NavStyles>
                <Link href="/items">
                    <a>Shop</a>
                </Link>
                {me && (
                    <>
                        <Link href="/sell">
                            <a>Sell</a>
                        </Link>
                        <Link href="/orders">
                            <a>Orders</a>
                        </Link>
                        <Link href="/me">
                            <a>Account</a>
                        </Link>
                        <Signout />
                        <Mutation mutation={TOGGLE_CART_MUTATION}>
                            {(toggleCart) => (
                                <button onClick={toggleCart}>
                                    My Cart
                                    {/* we can take the cart and count the number of items that are inside of it. Reduce is going to start with a zero */}
                                    <CartCount count={me.cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0)}></CartCount>
                                </button>
                            )}
                        </Mutation>
                    </>
                )}
                {!me && (
                    <Link href="/signup">
                        <a>Sign In</a>
                    </Link>
                )}
            </NavStyles>
        )}
    </User>
);

export default Nav;