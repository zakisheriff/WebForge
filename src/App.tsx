import { useEffect, useState } from 'react';
import PopupView from './popup/PopupView';
import DashboardView from './dashboard/DashboardView';

export default function App() {
  const [mode, setMode] = useState<'popup' | 'dashboard'>('popup');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'dashboard') {
      setMode('dashboard');
      document.body.classList.add('dashboard-mode');
      document.body.classList.remove('popup-mode');
    } else {
      setMode('popup');
      document.body.classList.add('popup-mode');
      document.body.classList.remove('dashboard-mode');
    }
  }, []);

  return mode === 'dashboard' ? <DashboardView /> : <PopupView />;
}
