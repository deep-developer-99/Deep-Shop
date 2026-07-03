import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { useLocation } from "react-router-dom";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        if (!res.ok) {
          throw new Error(`Failed to load products: ${res.status}`);
        }
        const data = await res.json();
        setProducts(Array.isArray(data) ? data.slice(0, 4) : []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="home-container">
      <div className="hero-banner">
        <h1>Welcome to DeepShop</h1>
        <p>Discover the best products at unbeatable price</p>
      </div>
      <h2>Featured Products</h2>
      {loading ? (
        <div>Loading....</div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
