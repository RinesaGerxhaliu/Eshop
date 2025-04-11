import React, { useEffect, useState } from 'react';
import './Homepage.css'; 
import Navbar from './Navbar';
import Footer from './Footer';


const ProductCard = ({ name, description, price }) => {
    return (
      <div className="product-card">
        <h2 className="product-name">{name}</h2>
        <p className="product-description">{description}</p>
        <p className="product-price">{price} €</p>
      </div>
    );
  };

const Homepage = () => {
   const [products, setProducts] = useState([]); // me i ru produktet

 
   useEffect(() => {
    fetch('https://localhost:5050/products')
      .then(response => response.json())
      .then(data => {
        console.log("Te dhenat nga API:", data);
  
        
        if (data && data.products && Array.isArray(data.products.data)) {
          setProducts(data.products.data);
        } else {
          console.warn("Format i panjohur nga API");
          setProducts([]);
        }
      })
      .catch(error => console.error("Gabim:", error));
  }, []);
  
  
  
  
  
  

  return (
    <>
    <Navbar />
      <div>
        <section
              className="hero"
              style={{
                  backgroundImage: `url("/Assets/heroo.jpg")`
              }}
      >
            <div className="hero-text">
              <h1>Nature Your Skin</h1>
              <p>Discover our natural body oils collection.</p>
              <button>SHOP COLLECTION</button>
            </div>
        </section>


       {/*  produktet */}
      <div className="product-section">
       <h2>Popular Product</h2>
        <div className="product-grid">
        {Array.isArray(products) && products.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
              />
        ))}
        </div>
      </div>

      <section className="services">
        <div className="container">
          <div className="service">
            <img src="./Assets/cream.png" alt="cream" />
            <h3>Bronzing</h3>
            <p>Illuminate your skin with our expert bronzing treatments.</p>
            <a href="#">Discover More</a>
          </div>
          <div className="service">
            <img src="./Assets/kos.png" alt="product" />
            <h3>Wellness Products</h3>
            <p>Enhance your well-being with our curated selection of products.</p>
            <a href="#">Explore Now</a>
          </div>
          <div className="service">
            <img src="./Assets/foundation.png" alt="Body Treatments" />
            <h3>Body Care</h3>
            <p>Revitalize your skin with our nourishing body treatments.</p>
            <a href="#">Learn More</a>
          </div>
        </div>
      </section>

      <section className="lifestyle">
        <div className="container">
          <div className="lifestyle-content">
            <h2>Elevate Your Lifestyle by Bringing Balance and Well Being Into Your Life</h2>
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
                "I am OBSESSED with the eyeshadow palette! The pigment is stunning, and it blends like a dream.
                Perfect for creating both subtle and bold looks. This is my go-to store for makeup now!"
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
    <Footer/>
    </> 
  );
};

export default Homepage;
