import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: localStorage.getItem("cartItems")
    ? JSON.parse(localStorage.getItem("cartItems"))
    : [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const quantityToAdd = item.qty || 1;

      const existItem = state.cartItems.find(
        (x) => x.productId === item.productId,
      );

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x.productId === item.productId
            ? { ...x, qty: x.qty + quantityToAdd }
            : x,
        );
      } else {
        state.cartItems.push({ ...item, qty: quantityToAdd });
      }

      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    decrementCartQty: (state, action) => {
      const productId = action.payload;

      const existItem = state.cartItems.find((x) => x.productId === productId);

      if (!existItem) {
        return;
      }

      if (existItem.qty <= 1) {
        state.cartItems = state.cartItems.filter(
          (x) => x.productId !== productId,
        );
      } else {
        state.cartItems = state.cartItems.map((x) =>
          x.productId === productId ? { ...x, qty: x.qty - 1 } : x,
        );
      }

      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (x) => x.productId !== action.payload,
      );

      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem("cartItems");
    },
  },
});

export const { addToCart, decrementCartQty, removeFromCart, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
