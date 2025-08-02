'use client';

import Image from 'next/image';

export default function DonateModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal" style={{ display: 'block' }} onClick={handleBackdropClick}>
      <div className="modal-donate">
        <div className="score-text">DONATE HERE</div>
        <Image className="qr" src="/QR.png" width={320} height={320} alt="QR Code" />
        <button onClick={onClose} className="next-btn">
          <div className="next-text">CLOSE</div>
        </button>
      </div>
    </div>
  );
}