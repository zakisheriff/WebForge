import { useEffect, useState } from 'react';
import PopupView from './popup/PopupView';
import DashboardView from './dashboard/DashboardView';

export default function App() {
  const [mode, setMode] = useState<'popup' | 'dashboard'>('popup');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'dashboard') {
      setMode('dashboard');
    }
  }, []);

  return mode === 'dashboard' ? <DashboardView /> : <PopupView />;
}
