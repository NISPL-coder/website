import React, { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';
import './WhatsAppButton.css';

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(true);

  // Net Infotech System Pvt. Ltd. WhatsApp hotline
  const phoneNumber = '919330113000';
  const defaultMessage = encodeURIComponent(
    'Hello Net Infotech System! I would like to enquire about your TallyPrime, Cloud Hosting & IT Infrastructure solutions.'
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <div className="nis-whatsapp-widget" role="complementary" aria-label="WhatsApp Contact">
      
      {/* Floating Greeting Tooltip */}
      {showTooltip && (
        <div className="nis-whatsapp-tooltip animate-fade-in">
          <div className="tooltip-avatar">
            <span className="online-dot" />
            <span className="avatar-text">NIS</span>
          </div>
          <div className="tooltip-content">
            <span className="tooltip-title">Need help with IT or Tally?</span>
            <span className="tooltip-sub">Chat directly with our team</span>
          </div>
          <button
            type="button"
            className="tooltip-close-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTooltip(false);
            }}
            aria-label="Close message"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="nis-whatsapp-float-btn"
        title="Chat with Net Infotech System on WhatsApp (+91 9330113000)"
        aria-label="Chat with Net Infotech System on WhatsApp"
      >
        {/* Pulsing ring animation */}
        <span className="nis-whatsapp-pulse-ring" />

        {/* WhatsApp Icon */}
        <svg
          className="nis-whatsapp-icon"
          viewBox="0 0 32 32"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 2C8.28 2 2 8.28 2 16c0 2.76.79 5.34 2.16 7.54L2.05 30l6.64-2.07C10.79 29.18 13.31 30 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.53c-2.38 0-4.63-.73-6.52-2.01l-.47-.31-4.32 1.35 1.37-4.2-.31-.49C4.38 19.92 3.65 18 3.65 16c0-6.81 5.54-12.35 12.35-12.35 6.81 0 12.35 5.54 12.35 12.35 0 6.81-5.54 12.35-12.35 12.35zm6.78-9.25c-.37-.19-2.2-1.09-2.54-1.21-.34-.12-.59-.19-.84.19-.25.37-.96 1.21-1.18 1.46-.22.25-.43.28-.8.09-.37-.19-1.57-.58-2.99-1.85-1.11-.99-1.85-2.22-2.07-2.59-.22-.37-.02-.57.16-.76.17-.17.37-.43.56-.65.19-.22.25-.37.37-.62.12-.25.06-.46-.03-.65-.09-.19-.84-2.02-1.15-2.77-.3-.72-.61-.62-.84-.63-.22-.01-.47-.01-.71-.01-.25 0-.65.09-.99.46-.34.37-1.3 1.27-1.3 3.1 0 1.83 1.33 3.6 1.52 3.85.19.25 2.62 4 6.35 5.61.89.38 1.58.61 2.12.78.89.28 1.7.24 2.34.15.71-.11 2.2-.9 2.51-1.77.31-.87.31-1.61.22-1.77-.09-.16-.34-.25-.71-.44z" />
        </svg>

        {/* Online Status Indicator */}
        <span className="nis-whatsapp-badge" title="Online now" />
      </a>

    </div>
  );
}
