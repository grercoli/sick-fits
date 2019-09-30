export default function calcTotalPrice(cart) {
  return cart.reduce((tally, cartItem) => { //reduce: take every single item and sort of mash them into each other . Then for each one we get a tally and the cart item
    if (!cartItem.item) return tally; //there is the possibility that you add something to your cart and someone deletes the item, but you still have a cart item that is relation to something that doesnt exist so we need to make sure that that item is still there
    return tally + cartItem.quantity * cartItem.item.price;
  }, 0); //we start with 0 cents
}
//IMPORTANT THE TOTAL OF THIS WILL SHOW IN CENTS!