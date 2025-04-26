// src/Views/Pages/Homepage.jsx
import React, { useEffect, useState } from 'react';
import '../../Styles/Homepage.css';
import ProductCard from '../../Components/UI/ProductCard';

const API = 'https://localhost:5050';


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
        console.error('Fetch error:', err);
        setErrorMsg(err.message);
      });
  }, []);

  return (
    <>
      <div>
        <section
          className="hero"
          style={{ backgroundImage: `url("/Assets/heroo.jpg")` }}
        >
          <div className="hero-text">
            <h1>Nature Your Skin</h1>
            <p>Discover our natural body oils collection.</p>
            <button>SHOP COLLECTION</button>
          </div>
        </section>

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
          id={prod.id}
          name={prod.name}
          price={prod.price}
          imageUrl={prod.imageUrl}
          reviews={prod.reviews}
        />
        
            ))}
          </div>
      </section>
        
          {/* Benefit Section */}
        <div className="benefit-container">
          <div className="benefit-left">
            <div className="photo-wrapper">
              <img src="./Assets/benefit1.jpg" alt="Main Product" className="big-photo" />
              <img src="./Assets/benefit2.jpg" alt="Small Product" className="small-photo" />
            </div>
          </div>

          <div className="benefit-right">
            <h2 className="benefit-title">Benefit Using Our Products</h2>
            <div className="benefit-grid">
              <div className="benefit-item">
                <div className="icon">
                  <i className="fa fa-leaf" style={{ color: '#f5c99a' }}></i>
                </div>
                <h3>100% Natural</h3>
                <p>It is an advanced formula designed to support your well-being with natural ingredients.</p>
              </div>
              <div className="benefit-item">
                <div className="icon">
                  <i className="fa fa-shield-alt" style={{ color: '#f5c99a' }}></i>
                </div>
                <h3>No Side Effect</h3>
                <p>Gentle on the skin without any harsh side effects.</p>
              </div>
              <div className="benefit-item">
                <div className="icon">
                  <i className="fa fa-smile" style={{ color: '#f5c99a' }}></i>
                </div>
                <h3>For all Skin Types</h3>
                <p>Suitable for all skin types with nourishing ingredients.</p>
              </div>
              <div className="benefit-item">
                <div className="icon">
                  <i className="fas fa-sync-alt"></i>
                </div>
                <h3>Product Replacement</h3>
                <p>Guaranteed satisfaction with easy replacement policy.</p>
              </div>
            </div>
          </div>
        </div>
        <section className="lifestyle">
          <div className="container">
            <div className="lifestyle-content">
              <h2>
                Elevate Your Lifestyle by Bringing Balance and Well Being Into Your Life
              </h2>
              <p>
                Take the time to care for your body and mind. Our experts are here to provide the highest quality service to bring balance and wellness to your lifestyle.
              </p>
              <div className="icons">
                <div className="icon-item">
                  <img src="./Assets/Capture.PNG" alt="Experts" />
                  <p>Beauty Experts</p>
                </div>
                <div className="icon-item">
                  <img src="./Assets/Capture2.PNG" alt="Quality Services" />
                  <p>Quality Services</p>
                </div>
                <div className="icon-item">
                  <img src="./Assets/Capture3.PNG" alt="More" />
                  <p>And More...</p>
                </div>
              </div>
            </div>
            <div className="lifestyle-image">
              <img src="./Assets/images.jpg" alt="Lifestyle Image" />
            </div>
          </div>
        </section>

        <section className="review" id="review">
          <div className="review-box">
            <h2 className="heading">
              Client <span>Reviews</span>
            </h2>
            <div className="wrapper">
              <div className="review-item">
                <img src="./Assets/person1.avif" alt="" />
                <h2>Lea</h2>
                <div className="rating">
                  <i className="bx bxs-star" id="Star"></i>
                  <i className="bx bxs-star" id="Star"></i>
                  <i className="bx bxs-star" id="Star"></i>
                  <i className="bx bxs-star" id="Star"></i>
                  <i className="bx bxs-star" id="Star"></i>
                </div>
                <p>
                  I ordered the skincare set, and my skin has never looked better! The serum works wonders,
                  and the moisturizer feels so light. I appreciate the eco-friendly packaging too. Highly recommend!
                </p>
              </div>
              <div className="review-item">
                <img src="./Assets/person2.jpg" alt="" />
                <h2>Sara</h2>
                <div className="rating">
                  <i className="bx bxs-star" id="Star"></i>
                  <i className="bx bxs-star" id="Star"></i>
                  <i className="bx bxs-star" id="Star"></i>
                  <i className="bx bxs-star" id="Star"></i>
                </div>
                <p>
                  The lipstick bundle is a great value for the price. The colors are vibrant and long-lasting,
                  though I wish they were a bit more moisturizing. Overall, I’m really happy with my purchase!
                </p>
              </div>
              <div className="review-item">
                <img src="./Assets/person3.webp" alt="" />
                <h2>Olivia</h2>
                <div className="rating">
                  <i className="bx bxs-star" id="Star"></i>
                  <i className="bx bxs-star" id="Star"></i>
                  <i className="bx bxs-star" id="Star"></i>
                  <i className="bx bxs-star" id="Star"></i>
                  <i className="bx bxs-star" id="Star"></i>
                </div>
                <p>
                  I am OBSESSED with the eyeshadow palette! The pigment is stunning, and it blends like a dream.
                  Perfect for creating both subtle and bold looks. This is my go-to store for makeup now!
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Homepage;
