import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import '../../Styles/DeleteReviewModal.css'

const DeleteReviewModal = ({ showModal, setShowModal, reviewId, productId }) => {
  const [errorMsg, setErrorMsg] = useState('');

  const handleDelete = () => {
    fetch(`https://localhost:5050/products/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          // If deleted successfully, close the modal and perform any other logic
          setShowModal(false);
          alert('Review deleted successfully!');
          // Optionally, you can trigger a fetch to update the reviews in ProductReviews
        } else {
          setErrorMsg('Failed to delete the review.');
        }
      })
      .catch((err) => {
        setErrorMsg('An error occurred. Please try again.');
        console.error('❌ Error deleting review:', err);
      });
  };

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete this review?</Modal.Body>
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={() => setShowModal(false)}
        >
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={handleDelete}
        >
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteReviewModal;
