import React, { useState, useEffect } from "react";
import { api } from "../utils/api";

// ── Star Rating Component ─────────────────────────────────────
const StarRating = ({ value, onChange, readonly = false, size = 28 }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="star-rating" style={{ display: "flex", gap: 4, cursor: readonly ? "default" : "pointer" }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hovered || value) >= star;
        return (
          <span
            key={star}
            style={{
              fontSize: size,
              color: filled ? "#e08c3a" : "#e0d6d6",
              transition: "color 0.15s, transform 0.1s",
              transform: !readonly && hovered === star ? "scale(1.2)" : "scale(1)",
              display: "inline-block",
              lineHeight: 1,
            }}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onClick={() => !readonly && onChange && onChange(star)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

// ── Review Card ───────────────────────────────────────────────
const ReviewCard = ({ review, isOwn, onEdit, onDelete }) => {
  const date = new Date(review.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className={`review-card ${isOwn ? "review-card-own" : ""}`}>
      <div className="review-card-top">
        <div className="review-anon-badge">
          <span className="review-anon-icon">🌸</span>
          <span className="review-anon-name">{review.anonName}</span>
          {isOwn && <span className="review-own-tag">You</span>}
        </div>
        <div className="review-card-right">
          <StarRating value={review.rating} readonly size={18} />
          <span className="review-date">{date}</span>
        </div>
      </div>
      <p className="review-text">"{review.text}"</p>
      {isOwn && (
        <div className="review-own-actions">
          <button className="btn-soft review-edit-btn" onClick={onEdit}>✏️ Edit</button>
          <button className="btn-muted review-delete-btn" onClick={onDelete}>🗑 Delete</button>
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
const Reviews = ({ user }) => {
  const [reviews, setReviews]       = useState([]);
  const [stats, setStats]           = useState(null);
  const [myReview, setMyReview]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState(false);
  const [form, setForm]             = useState({ rating: 0, text: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");

  const fetchAll = async () => {
    try {
      const [revRes, statsRes, mineRes] = await Promise.all([
        api.get("/api/reviews"),
        api.get("/api/reviews/stats"),
        user?.id ? api.get("/api/reviews/mine") : Promise.resolve(null),
      ]);

      if (revRes.ok)   setReviews(await revRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (mineRes?.ok) {
        const mine = await mineRes.json();
        setMyReview(mine);
        if (mine) setForm({ rating: mine.rating, text: mine.text });
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [user]);

  const handleSubmit = async () => {
    setError("");
    if (!form.rating) { setError("Please select a star rating."); return; }
    if (form.text.trim().length < 10) { setError("Review must be at least 10 characters."); return; }

    setSubmitting(true);
    try {
      const res = editing
        ? await api.put("/api/reviews", form)
        : await api.post("/api/reviews", form);

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit review.");
      } else {
        setSuccess(editing ? "Review updated! ✅" : "Review submitted! Thank you 🌸");
        setShowForm(false);
        setEditing(false);
        fetchAll();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setSubmitting(false);
  };

  const handleEdit = () => {
    setForm({ rating: myReview.rating, text: myReview.text });
    setEditing(true);
    setShowForm(true);
    setError("");
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your review?")) return;
    await api.delete("/api/reviews");
    setMyReview(null);
    setForm({ rating: 0, text: "" });
    setSuccess("Review deleted.");
    fetchAll();
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditing(false);
    setError("");
    if (myReview) setForm({ rating: myReview.rating, text: myReview.text });
    else setForm({ rating: 0, text: "" });
  };

  if (loading) {
    return (
      <div className="reviews-page">
        <div className="loading-spinner">Loading reviews…</div>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      {/* Header */}
      <div className="reviews-header">
        <div>
          <h2>💬 Community Reviews</h2>
          <p>All reviews are anonymous. Real feelings, real people.</p>
        </div>
      </div>

      {/* Stats Banner */}
      {stats && stats.totalReviews > 0 && (
        <div className="reviews-stats-banner">
          <div className="reviews-avg-block">
            <span className="reviews-avg-num">{stats.avgRating}</span>
            <StarRating value={Math.round(stats.avgRating)} readonly size={22} />
            <span className="reviews-total">{stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""}</span>
          </div>
          <div className="reviews-dist">
            {[5,4,3,2,1].map(star => {
              const count = stats.distribution[star] || 0;
              const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={star} className="reviews-dist-row">
                  <span className="reviews-dist-label">{star}★</span>
                  <div className="reviews-dist-track">
                    <div className="reviews-dist-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="reviews-dist-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="reviews-success">{success}</div>
      )}

      {/* Write / Edit review CTA */}
      {user?.id && !showForm && (
        <div className="reviews-cta">
          {myReview ? (
            <p className="reviews-cta-note">
              You've already reviewed SoulSpace. You can edit or delete it below.
            </p>
          ) : (
            <button className="btn-primary reviews-write-btn"
              onClick={() => { setShowForm(true); setEditing(false); }}>
              ✍️ Write a Review
            </button>
          )}
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="reviews-form-card">
          <h3>{editing ? "Edit Your Review" : "Share Your Experience"}</h3>
          <p className="reviews-form-note">
            Your review will be shown anonymously 🌸
          </p>

          <div className="reviews-form-rating">
            <label>Your Rating</label>
            <StarRating value={form.rating} onChange={(r) => setForm(p => ({ ...p, rating: r }))} size={36} />
          </div>

          <div className="reviews-form-text">
            <label>Your Review</label>
            <textarea
              className="journal-textarea"
              placeholder="Tell others about your experience with SoulSpace…"
              value={form.text}
              onChange={(e) => setForm(p => ({ ...p, text: e.target.value }))}
              rows={4}
              maxLength={500}
            />
            <span style={{ fontSize: 12, color: "#9b7c78" }}>{form.text.length}/500</span>
          </div>

          {error && (
            <p style={{ color: "#f44336", fontSize: 13,
              background: "#fff3f2", borderRadius: 8, padding: "8px 12px" }}>
              {error}
            </p>
          )}

          <div className="reviews-form-actions">
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : editing ? "Update Review" : "Submit Review"}
            </button>
            <button className="btn-muted" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="reviews-empty">
            <p>No reviews yet. Be the first to share your experience! 🌸</p>
          </div>
        ) : (
          reviews.map((r) => (
            <ReviewCard
              key={r._id}
              review={r}
              isOwn={myReview?._id === r._id}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;
