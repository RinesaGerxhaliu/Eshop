import React, { useEffect, useState } from 'react';
import ProductCard from '../../Components/UI/ProductCard';
import bgImg from '../../assets/images/IMG_2075.jpeg';



const API = 'https://localhost:5050';

export default function Homepage() {
  const [products, setProducts] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
  fetch(`${API}/products/newest`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      return res.json();
    })
    .then(setProducts)
    .catch(err => {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : String(err)
      );
    });
}, []);


  return (
    <>
      
      <div style={{ fontFamily: 'Poppins, sans-serif' }}>
   <section
      className="hero-section"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1>Skincare Essentials</h1>
        <p>Treat your skin with love and care.</p>
        <a href="#products" className="hero-btn">
          🛍️ Shop Now
        </a>
      </div>
    </section>
        <section id="products" className="py-5" style={{ background: '#fff0f6' }}>
          <div className="container">
            <h2 className="text-center fw-bold mb-5" style={{ color: '#ab6c93', fontFamily: 'Poppins, sans-serif' }}>
              ✨ New Arrivals ✨
            </h2>
            {errorMsg && <div className="alert alert-danger text-center">{errorMsg}</div>}
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
              {products.map(p => (
                <div key={p.id} className="col">
                  <ProductCard
                    {...p}
                    className="bg-white p-3 rounded shadow-sm hover-grow"
                    style={{ transition: 'transform .2s' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-5" style={{ background: '#ffffff' }}>
  <div className="container d-flex flex-column">
    <div className="d-flex align-items-start flex-wrap mb-4" style={{ gap: '1.5rem' }}>
      <h2 className="fw-bold mb-0" style={{ color: '#ab6c93', fontFamily: 'Poppins, sans-serif' }}>
        Why You&apos;ll Love Us
      </h2>
      <div className="d-flex flex-wrap" style={{ gap: '1.5rem' }}>
        {[
          ['🌱', 'Natural', 'Plant-based goodness'],
          ['💧', 'Hydrating', 'Deep moisture boost'],
          ['🌸', 'Gentle', 'Soft on all skin'],
          ['✨', 'Radiant', 'Glow from within']
        ].map(([emoji, title, desc], idx) => (
          <div key={idx} className="bg-whisper p-5 rounded shadow-light text-center" style={{ width: '200px' }}>
            <div className="display-2 mb-3">{emoji}</div>
            <h5 className="fw-semibold mb-2" style={{ color: '#ab6c93' }}>{title}</h5>
            <p className="text-muted small mb-0">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

        <section className="py-5 text-center" style={{ background: '#fff5f8' }}>
  <div className="container">
    <div className="d-flex align-items-start flex-wrap mb-4" style={{ gap: '1.5rem' }}>
      <h2 className="fw-bold mb-0" style={{ color: '#ab6c93', fontFamily: 'Poppins, sans-serif' }}>
        Elevate Your Glow
      </h2>
      <p className="mb-0" style={{ color: '#666', maxWidth: '400px' }}>
        Balance your beauty routine with expert care and premium ingredients.
      </p>
    </div>
    <div className="d-flex justify-content-center gap-5">
      {[
        ['/Assets/Capture.PNG', 'Expert Tips'],
        ['/Assets/Capture2.PNG', 'Quality Care'],
        ['/Assets/Capture3.PNG', 'Love Yourself']
      ].map(([src, label], idx) => (
        <div key={idx} className="text-center">
          <img src={src} alt={label} className="rounded-circle shadow-sm mb-2" style={{ width: 100, height: 100 }} />
          <p className="small mb-0" style={{ color: '#ab6c93' }}>{label}</p>
        </div>
      ))}
    </div>
  </div>
</section>

        <style jsx>{`
          .btn-pink { background-color: #ff66a3; color: white; font-family: 'Poppins', sans-serif; }
          .btn-pink:hover { background-color: #ff4d8c; }
          .shadow-light { box-shadow: 0 6px 20px rgba(255, 102, 163, 0.2); }
          .bg-whisper { background-color: #fff5f8; }
          .hover-grow:hover { transform: scale(1.05); }
        `}</style>
      </div>
    </>
  );
}
