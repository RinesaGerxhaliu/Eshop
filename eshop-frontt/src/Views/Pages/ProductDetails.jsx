// src/Views/Pages/ProductDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../Styles/ProductDetails.css';
import { useCurrency } from '../../contexts/CurrencyContext';

const ProductDetails = () => {
  const { id } = useParams();
  const { convert, format } = useCurrency();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const refreshToken = async () => {
    /* …your existing refresh logic… */
  };

  const fetchProduct = async () => {
    try {
      const response = await fetch(`https://localhost:5050/products/${id}`);
      if (!response.ok) throw new Error('Product not found');
      const data = await response.json();
      setProduct(data.product);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = async e => {
    /* …your existing add‐to‐cart logic… */
  };

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>Error: {error}</p>;
  if (!product) return <p>Product not found.</p>;

  // new: compute display price via currency context
  const displayPrice = format(convert(product.price));

  return (
    <div className="container-product">
      <section className="product-details">
        <div className="product-images">
          <img
            src={`https://localhost:5050${product.imageUrl}`}
            alt={product.name}
            className="main-image"
          />
        </div>

        <div className="product-infoo">
          <h1>{product.name}</h1>
          <p className="product-descriptionn">{product.description}</p>
          {/* updated price display */}
          <p className="product-pricee">{displayPrice}</p>

          <div className="product-rating">
            Review: ★★★★☆ ({product.reviews} Reviews)
          </div>

          <form onSubmit={handleAddToCart}>
            <div className="product-options">
              <div className="quantity-cart-row">
                <div className="quantity">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >
                    –
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQuantity(q => q + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  className="add-to-cart"
                  type="submit"
                  disabled={isAdding}
                >
                  {isAdding ? 'Adding...' : isAdded ? 'Added' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
