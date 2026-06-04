/**
 * useNotification — toast notification with auto-dismiss.
 */
import { useRef, useState } from "react";

export function useNotification(durationMs = 3000) {
  const [notification, setNotification] = useState(null);
  const timeout = useRef(null);

  const showNotification = (type, text) => {
    if (timeout.current) clearTimeout(timeout.current);
    setNotification({ type, text });
    timeout.current = setTimeout(() => {
      setNotification(null);
      timeout.current = null;
    }, durationMs);
  };

  const dismissNotification = () => {
    if (timeout.current) clearTimeout(timeout.current);
    setNotification(null);
  };

  return { notification, showNotification, dismissNotification };
}
