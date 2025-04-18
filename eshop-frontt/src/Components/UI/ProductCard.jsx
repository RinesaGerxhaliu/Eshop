// src/components/ProductCard.jsx
import React from 'react';
import '../../Styles/Homepage.css';

const ProductCard = ({ name, description, price, imageUrl }) => {
  // If no imageUrl, you can show a placeholder
  const src = imageUrl
    ? `https://localhost:5050${imageUrl}`
    : '/Assets/placeholder.png';

  return (
    <div className="product-card">
      <img
        src={src}
        alt={name}
        className="product-image"
        style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
      />
      <h2 className="product-name">{name}</h2>
      <p className="product-description">{description}</p>
      <p className="product-price">{price} €</p>
    </div>
  );
};

export default ProductCard;
