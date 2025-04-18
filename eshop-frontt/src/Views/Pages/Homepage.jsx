// src/Views/Pages/Homepage.jsx
import React, { useEffect, useState } from 'react';
import ProductCard from '../../Components/UI/ProductCard';
import '../../Styles/Homepage.css';

const API = 'https://localhost:5050';  // your API base URL

const Homepage = () => {
  const [products, setProducts] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch(`${API}/products?PageIndex=0&PageSize=8`, {
      mode: 'cors'
    })
      .then(res => {
        console.log('⬅️ Status:', res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('⬅️ JSON payload:', data);
        if (data.products?.data) {
          setProducts(data.products.data);
        } else {
          throw new Error('Unexpected response shape');
        }
      })
      .catch(err => {
        console.error('❌ Fetch error:', err);
        setErrorMsg(err.message);
      });
  }, []);

  return (
    <section className="product-section">
      <h2>Popular Products</h2>
      {errorMsg && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          Error loading products: {errorMsg}
        </div>
      )}
      <div className="product-grid">
        {products.map(prod => (
          <ProductCard
            key={prod.id}
            name={prod.name}
            description={prod.description}
            price={prod.price}
            imageUrl={prod.imageUrl}
          />
        ))}
      </div>
    </section>
  );
};

export default Homepage;
