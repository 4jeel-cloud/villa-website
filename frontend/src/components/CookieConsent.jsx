import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('cookieConsent');
    if (!dismissed) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookieConsent', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookieConsent">
      <div className="cookieConsentInner">
        <div className="cookieConsentText">
          This website uses essential session cookies for authentication only.
          No tracking or analytics cookies are used.
        </div>
        <button className="cookieConsentBtn" onClick={accept}>Accept</button>
      </div>
    </div>
  );
}
