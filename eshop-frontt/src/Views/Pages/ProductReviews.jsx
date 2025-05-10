import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import DeleteReviewModal from './DeleteReviewModal';
import EditReview from './EditReview';
import axios from 'axios';
import '../../Styles/ProductReviews.css';
const API = 'https://localhost:5050';

const ProductReviews = () => {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);

  const handleReviewUpdate = (updatedReview) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === updatedReview.id ? updatedReview : r))
    );
  };

  const handleReviewDelete = (reviewId) => {
    setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewId));
    setShowModal(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const userId = decoded.sub;
        setCurrentUserId(userId);
        localStorage.setItem('userId', userId);
      } catch (err) {
        console.error('❌ Error decoding token:', err);
        setCurrentUserId(null);
      }
    }
  }, []);

  useEffect(() => {
    fetch(`${API}/products/${id}/reviews`, {
      mode: 'cors',
    })
      .then((res) => {
        if (res.status === 204) return [];
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setReviews(data);
      })
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddReview = (newReview) => {
    setReviews((prevReviews) => [newReview, ...prevReviews]);
  };

  if (loading) return <p>Loading reviews...</p>;
  if (errorMsg) return <p>Error: {errorMsg}</p>;
  if (reviews.length === 0) return <p>No reviews yet.</p>;

  const sortedReviews = [...reviews].sort((a, b) => b.id - a.id);
  const visibleReviews = showAll ? sortedReviews : sortedReviews.slice(0, 5);

  return (
    <div>
      <h3 className="product-reviews-title">
        Product Reviews
      </h3>

      <ul>
        {visibleReviews.map((review) => {
          const isAuthor = review.reviewerUserId === currentUserId;
          return (
            <li key={review.id} className="mb-3">
              <div className="review-text-block">
                <div className="review-content">
                  <span className="reviewer-name">{review.reviewerUserName}</span>

                  <div className="review-stars">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`star ${i < review.rating ? 'filled' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <div className="review-text">{review.reviewText}</div>
                </div>

                {isAuthor && (
                  <div className="review-actions">
                    <FaEdit
                      size={20}
                      color="#6c757d"
                      style={{ cursor: 'pointer' }}
                      title="Edit Review"
                      onClick={() => setEditingReviewId(review.id)}
                    />
                    <FaTrashAlt
                      size={20}
                      color="#6c757d"
                      style={{ cursor: 'pointer' }}
                      title="Delete Review"
                      onClick={() => {
                        setReviewToDelete(review.id);
                        setShowModal(true);
                      }}
                    />
                  </div>
                )}

              </div>
            </li>
          );
        })}
      </ul>

      {reviews.length > 5 && (
        <div
          className="load-more-btn"
          onClick={() => setShowAll((prev) => !prev)}
          title={showAll ? 'Show Less' : 'Show More'}
        >
          {showAll ? 'Show Less' : 'Load More'}
        </div>
      )}

      <DeleteReviewModal
        showModal={showModal}
        setShowModal={setShowModal}
        reviewId={reviewToDelete}
        onDelete={handleReviewDelete}
      />
    </div>
  );
};

export default ProductReviews;
