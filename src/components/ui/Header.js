'use client';

export default function Header({ onDonateClick }) {
  return (
    <header className="header">
      <div className="header-center">
        <h3 className="logo-title">VIGEOGUESSR</h3>
      </div>
      <div className="header-right">
        <div className="connect-wallet" onClick={onDonateClick}>
          <div style={{
            width: '20px',
            height: '20px',
            backgroundSize: 'contain'
          }}></div>
          <span className="wallet-text">BUY ME COFFEE</span>
        </div>
      </div>
    </header>
  );
}
