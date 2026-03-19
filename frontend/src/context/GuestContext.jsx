import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GUEST_ID_KEY, SURVEY_RESULTS_KEY } from '../constants/config';

const GuestContext = createContext(null);

export function GuestProvider({ children }) {
  const [surveyResults, setSurveyResults] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Strictly clear all guest-related data
    localStorage.removeItem(GUEST_ID_KEY);
    localStorage.removeItem(SURVEY_RESULTS_KEY);
  }, []);

  const saveSurveyResults = useCallback((results) => {
    setSurveyResults(results);
    // We still allow temporary session caching if needed, but the primary is now Supabase
    // To stay compliant with the request to remove guest keys, we don't save to localStorage here anymore.
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <GuestContext.Provider value={{ surveyResults, saveSurveyResults, toasts, addToast, removeToast }}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  const ctx = useContext(GuestContext);
  if (!ctx) throw new Error('useGuest must be used inside GuestProvider');
  return ctx;
}

export default GuestContext;
