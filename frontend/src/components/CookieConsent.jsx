import { memo, useState } from 'react';

// Derive visibility directly from localStorage at init time — avoids setState in useEffect
function getInitialVisible() {
  try { return !localStorage.getItem('cookieConsent'); } catch { return false; }
}

export default memo(function CookieConsent() {
  const [visible, setVisible] = useState(getInitialVisible);

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
});
