import React, { useState } from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import "../../Styles/DeleteReviewModal.css";

const DeleteReviewModal = ({
  showModal,
  setShowModal,
  reviewId,
  productId,
  onDeleteSuccess,
  setAverageRating,
}) => {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAverageRating = () => {
    return fetch(`https://localhost:5050/products/${productId}/average-rating`)
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

  const handleDelete = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`https://localhost:5050/products/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

   if (res.ok) {
  setShowModal(false);
  if (onDeleteSuccess) onDeleteSuccess(reviewId); // Parent do e thërrasë fetchAverageRating
  setMessage({ type: "success", text: "Review deleted successfully!" });
}
 else {
        setMessage({ type: "danger", text: "Failed to delete the review." });
      }
    } catch (err) {
      setMessage({ type: "danger", text: "An error occurred. Please try again." });
      console.error("❌ Error deleting review:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {message && (
        <Alert
          variant={message.type}
          onClose={() => setMessage(null)}
          dismissible
          style={{ marginBottom: "10px" }}
        >
          {message.text}
        </Alert>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this review?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DeleteReviewModal;
