import { useState, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { clearCart } from "../redux/cartSlice";

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );

  const handlePayment = async () => {
    try {
      const orderRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payment/order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalPrice, currency: "INR" }),
        },
      );
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        // Razorpay unconfigured exception handler
        const fallback = window.confirm(
          "Razorpay keys unconfigured on backend. Use Student Bypass Mode to place test order?",
        );
        if (fallback) {
          return bypassPayment();
        } else {
          return alert("Payment failed to initialize");
        }
      }

      const options = {
        key: orderData.key, // Dynamically loaded from backend's process.env.RAZORPAY_KEY_ID
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "deepshop",
        description: "Test Transaction",
        order_id: orderData.order.id,
        handler: async function (response) {
          const verifyRes = await fetch(
            `${import.meta.env.VITE_API_URL}/api/payment/verify-payment`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            },
          );
          if (verifyRes.ok) {
            const saveOrderRes = await fetch(
              `${import.meta.env.VITE_API_URL}/api/orders`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                  items: cartItems.map((item) => ({
                    product: item.productId,
                    quantity: item.qty,
                    price: item.price,
                  })),
                  totalAmount: totalPrice,
                  address,
                  paymentId: response.razorpay_payment_id,
                }),
              },
            );

            if (saveOrderRes.ok) {
              dispatch(clearCart());
              navigate("/order-success");
            } else {
              alert("Order saving failed");
            }
          } else {
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: address.fullName,
          email: user?.email,
          contact: "9999999999",
        },
        theme: {
          color: "#f97316",
        },
        checkout: {
          config: {
            display: {
              blocks: {
                upi: {
                  name: "UPI Options",
                  instruments: [
                    {
                      method: "upi",
                      flows: ["collect", "qr"],
                    },
                  ],
                },
              },
              sequence: ["block.upi"],
              preferences: {
                show_default_blocks: true,
              },
            },
          },
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error(error);
    }
  };

  const bypassPayment = async () => {
    const saveOrderRes = await fetch(
      `${import.meta.env.VITE_API_URL}/api/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            product: item.productId,
            quantity: item.qty,
            price: item.price,
          })),
          totalAmount: totalPrice,
          address,
          paymentId: "bypass_txn_" + new Date().getTime(),
        }),
      },
    );
    if (saveOrderRes.ok) {
      dispatch(clearCart());
      navigate("/order-success");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login first");
      navigate("/login");
      return;
    }
    handlePayment();
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="shipping-form">
          <h3>Shipping Address</h3>
          <input
            type="text"
            placeholder="Full Name"
            required
            value={address.fullName}
            onChange={(e) =>
              setAddress({ ...address, fullName: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Street"
            required
            value={address.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
          />
          <input
            type="text"
            placeholder="City"
            required
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
          />
          <input
            type="text"
            placeholder="State"
            required
            value={address.state}
            onChange={(e) => setAddress({ ...address, state: e.target.value })}
          />
          <input
            type="text"
            placeholder="Postal Code"
            required
            value={address.postalCode}
            onChange={(e) =>
              setAddress({ ...address, postalCode: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Country"
            required
            value={address.country}
            onChange={(e) =>
              setAddress({ ...address, country: e.target.value })
            }
          />
          <div className="checkout-summary">
            <h4>Total to Pay: ₹{totalPrice.toFixed(2)}</h4>
            <button type="submit" className="btn">
              Pay Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
