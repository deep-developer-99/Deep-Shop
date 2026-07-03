import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  removeFromCart,
  addToCart,
  decrementCartQty,
} from "../redux/cartSlice";
import "../styles/cart.css";

const Cart = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleIncreaseQty = (item) => {
    dispatch(addToCart({ ...item, qty: 1 }));
  };

  const handleDecreaseQty = (item) => {
    dispatch(decrementCartQty(item.productId));
  };

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );

  return (
    <div className="cart-container">
      <h2>Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p>
          Your cart is empty.{" "}
          <Link to="/shop" className="go-to-shop-link">
            Go Shopping
          </Link>
        </p>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.productId} className="cart-item">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h4>{item.name}</h4>
                  <p>₹{item.price.toFixed(2)}</p>
                  <div className="qty-controls">
                    <button onClick={() => handleDecreaseQty(item)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => handleIncreaseQty(item)}>+</button>
                  </div>
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>Total: ₹{totalPrice.toFixed(2)}</h3>
            <button
              onClick={() => navigate("/checkout")}
              className="btn btn-checkout"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
