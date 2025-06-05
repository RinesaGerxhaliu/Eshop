import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import "../../Styles/DeleteReviewModal.css";

const DeleteReviewModal = ({
  showModal,
  setShowModal,
  reviewId,
  productId,
  onDeleteSuccess,
  setAverageRating,
}) => {
  const [errorMsg, setErrorMsg] = useState("");

  const fetchAverageRating = () => {
   fetch(`https://localhost:5050/products/${productId}/average-rating`)
     .then((res) => {
       if (!res.ok) throw new Error("Failed to fetch average rating");
       return res.json();
     })
     .then((data) => {
       setAverageRating(data.averageRating);
     })
     .catch((err) => {
       console.error("❌ Error fetching average rating:", err);
     });
 };

  const handleDelete = () => {
    fetch(`https://localhost:5050/products/reviews/${reviewId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          setShowModal(false);
          setErrorMsg("Review deleted successfully!");
          if (onDeleteSuccess) onDeleteSuccess(reviewId);
          fetchAverageRating();
        } else {
          setErrorMsg("Failed to delete the review.");
        }
      })
      .catch((err) => {
        setErrorMsg("An error occurred. Please try again.");
        console.error("❌ Error deleting review:", err);
      });
  };

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete this review?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteReviewModal;
