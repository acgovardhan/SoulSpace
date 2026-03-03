import React, { useState } from "react";

const CONTACT_EMAIL = "230993@tkmce.ac.in";
const CONTACT_PHONE = "Available soon..";

const FAQS = [
  {
    q: "Is my data confidential?",
    a: "Yes, your data is stored securely in MongoDB Atlas Cloud DataBase."
  },
  {
    q: "What should I do in a mental health emergency?",
    a: "If you are in immediate danger, contact local emergency services or use the Emergency Call option for 24/7 support."
  },
];

export default function ContactUs({ onClose }) {
  const [copied, setCopied] = useState({ email: false, phone: false });
  const [openIdx, setOpenIdx] = useState(null);

  const handleCopy = async (type, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied((s) => ({ ...s, [type]: true }));
      setTimeout(
        () => setCopied((s) => ({ ...s, [type]: false })),
        1500
      );
    } catch {
      alert("Copy failed. Please copy manually.");
    }
  };

  return (
    <div className="contact-overlay" onClick={onClose}>
      <div
        className="contact-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="contact-header">
          <h2>Get in Touch</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="contact-subtext">
          We’re here to support you. Reach out anytime, your wellbeing comes first.
        </p>

        {/* Contact Cards */}
        <div className="contact-cards">
          <div className="info-card">
            <div>
              <h3>Email us</h3>
              <a href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </div>
            <button
              className="copy-btn"
              onClick={() => handleCopy("email", CONTACT_EMAIL)}
            >
              {copied.email ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="info-card">
            <div>
              <h3>Call us</h3>
              <a href={`tel:${CONTACT_PHONE}`}>
                {CONTACT_PHONE}
              </a>
            </div>
            <button
              className="copy-btn"
              onClick={() => handleCopy("phone", CONTACT_PHONE)}
            >
              {copied.phone ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="faq-section">
          <h3>Frequently Asked Questions</h3>

          {FAQS.map((f, i) => (
            <div
              key={i}
              className={`faq-item ${openIdx === i ? "open" : ""}`}
            >
              <button
                className="faq-question"
                onClick={() =>
                  setOpenIdx(openIdx === i ? null : i)
                }
              >
                {f.q}
                <span>{openIdx === i ? "−" : "+"}</span>
              </button>

              {openIdx === i && (
                <p className="faq-answer">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
