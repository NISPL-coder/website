import React, { useState } from 'react';
import './LinkedInQRCode.css';

/**
 * LinkedInQRCode component
 * Displays a scannable and clickable QR Code card linking to the company LinkedIn profile.
 * Features an auto-fallback vector SVG for offline environments and an online scannable QR.
 */
export default function LinkedInQRCode({ 
  url = 'https://www.linkedin.com/company/net-infotech-system/',
  size = 62,
  title = 'Scan for LinkedIn'
}) {
  const [imgError, setImgError] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodedUrl}&color=0A66C2&bgcolor=FFFFFF&margin=1`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="nis-linkedin-qr-card"
      title={`${title} - Click or scan to visit LinkedIn`}
      aria-label="Scan or click to visit our LinkedIn company profile"
    >
      <div className="nis-linkedin-qr-frame" style={{ width: size, height: size }}>
        {!imgError ? (
          <img
            src={qrApiUrl}
            alt="LinkedIn QR Code"
            className="nis-linkedin-qr-img"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          /* Offline crisp vector QR Code with LinkedIn emblem */
          <svg
            className="nis-linkedin-qr-svg"
            viewBox="0 0 29 29"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Finder Pattern Top-Left */}
            <rect x="2" y="2" width="7" height="7" fill="#0A66C2" rx="1.2" />
            <rect x="3.2" y="3.2" width="4.6" height="4.6" fill="#FFFFFF" rx="0.6" />
            <rect x="4.4" y="4.4" width="2.2" height="2.2" fill="#0A66C2" rx="0.3" />

            {/* Finder Pattern Top-Right */}
            <rect x="20" y="2" width="7" height="7" fill="#0A66C2" rx="1.2" />
            <rect x="21.2" y="3.2" width="4.6" height="4.6" fill="#FFFFFF" rx="0.6" />
            <rect x="22.4" y="4.4" width="2.2" height="2.2" fill="#0A66C2" rx="0.3" />

            {/* Finder Pattern Bottom-Left */}
            <rect x="2" y="20" width="7" height="7" fill="#0A66C2" rx="1.2" />
            <rect x="3.2" y="21.2" width="4.6" height="4.6" fill="#FFFFFF" rx="0.6" />
            <rect x="4.4" y="22.4" width="2.2" height="2.2" fill="#0A66C2" rx="0.3" />

            {/* Timing dots */}
            <rect x="10" y="5" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="12" y="5" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="14" y="5" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="16" y="5" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="18" y="5" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="5" y="10" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="5" y="12" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="5" y="14" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="5" y="16" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="5" y="18" width="1.2" height="1.2" fill="#0A66C2" />

            {/* Data matrix dots */}
            <rect x="10" y="2" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="14" y="2" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="17" y="2" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="2" y="10" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="7" y="10" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="11" y="10" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="21" y="10" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="24" y="10" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="27" y="10" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="10" y="12" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="18" y="12" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="20" y="13" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="25" y="13" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="10" y="17" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="13" y="17" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="16" y="17" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="18" y="17" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="23" y="17" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="26" y="17" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="10" y="21" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="12" y="21" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="16" y="21" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="20" y="21" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="24" y="21" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="27" y="21" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="11" y="24" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="14" y="24" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="17" y="24" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="22" y="24" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="25" y="24" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="10" y="26" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="15" y="26" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="19" y="26" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="23" y="26" width="1.2" height="1.2" fill="#0A66C2" />
            <rect x="26" y="26" width="1.2" height="1.2" fill="#0A66C2" />

            {/* Center LinkedIn Logo Plaque */}
            <rect x="10" y="10" width="9" height="9" fill="#FFFFFF" rx="2" stroke="#E2E8F0" strokeWidth="0.6" />
            <rect x="11.2" y="11.2" width="6.6" height="6.6" fill="#0A66C2" rx="1.2" />
            <path
              d="M13.2 13.3H12.3V16H13.2V13.3ZM12.75 12.85C13.05 12.85 13.25 12.65 13.25 12.4C13.25 12.15 13.05 11.95 12.75 11.95C12.45 11.95 12.25 12.15 12.25 12.4C12.25 12.65 12.45 12.85 12.75 12.85ZM16.7 14.5C16.7 13.7 16.2 13.2 15.4 13.2C14.85 13.2 14.55 13.5 14.4 13.75V13.3H13.5V16H14.4V14.65C14.4 14.3 14.5 13.95 14.9 13.95C15.3 13.95 15.35 14.35 15.35 14.7V16H16.25V14.5H16.7Z"
              fill="#FFFFFF"
            />
          </svg>
        )}

        {/* Small LinkedIn Center Watermark on image */}
        {!imgError && (
          <div className="nis-linkedin-qr-center-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="4" fill="#0A66C2" />
              <path
                d="M7.5 9.5H5.2V18H7.5V9.5ZM6.35 8.2C7.15 8.2 7.7 7.65 7.7 6.95C7.7 6.25 7.15 5.7 6.35 5.7C5.55 5.7 5 6.25 5 6.95C5 7.65 5.55 8.2 6.35 8.2ZM18.5 13.5C18.5 11.2 17.15 9.8 15 9.8C13.6 9.8 12.8 10.6 12.4 11.2V9.5H10.1V18H12.4V13.9C12.4 12.9 12.7 11.9 13.8 11.9C14.9 11.9 15 12.9 15 13.9V18H17.3V13.5H18.5Z"
                fill="#FFFFFF"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="nis-linkedin-qr-label">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="#0A66C2">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.67 1.67 0 1 0-.02-3.34 1.67 1.67 0 0 0 .02 3.34m1.39 9.74v-8.37H5.07v8.37h2.78z"/>
        </svg>
        <span>LinkedIn</span>
      </div>

      {/* Hover tooltip */}
      <span className="nis-linkedin-qr-tooltip">
        Scan or click to open LinkedIn profile
      </span>
    </a>
  );
}
