import React from "react";

const helplines = [
  {
    name: "Tele MANAS (Govt. of India)",
    number: "14416 / 1-800-891-4416",
    description: "24x7 mental health support (toll-free)"
  },
  {
    name: "KIRAN",
    number: "1800-599-0019",
    description: "National Mental Health Rehabilitation Helpline"
  },
  {
    name: "iCALL (TISS)",
    number: "9152987821",
    description: "Mon–Sat, 8am–10pm"
  },
  {
    name: "AASRA",
    number: "+91-9820466726",
    description: "24x7 emotional support"
  },
  {
    name: "SNEHA",
    number: "044-24640050",
    description: "24x7 suicide prevention helpline"
  }
];

const EmergencySupport = ({ onClose }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Number copied to clipboard");
  };

  return (
    <div className="emergency-overlay">
      <div className="emergency-card">
        <div className="emergency-header">
          <h2>Emergency Mental Health Support 🇮🇳</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <p className="emergency-subtext">
          You are not alone. If you or someone you know needs immediate help,
          please reach out to one of the helplines below.
        </p>

        <div className="helpline-list">
          {helplines.map((item, index) => (
            <div key={index} className="helpline-card">
              <div>
                <h3>{item.name}</h3>
                <p className="helpline-desc">{item.description}</p>
                <span className="helpline-number">{item.number}</span>
              </div>

              <button
                className="copy-btn"
                onClick={() => copyToClipboard(item.number)}
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmergencySupport;
