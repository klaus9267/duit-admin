import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppFrame from './AppFrame';
import EventSubmissionPage from './pages/EventSubmissionPage';

// 라우팅 분기 로직
const App = () => {
  const path = window.location.pathname;

  // 사용자 제보 페이지
  if (path === '/submit') {
    return <EventSubmissionPage />;
  }

  // 관리자 페이지 (기본)
  return <AppFrame />;
};

createRoot(document.getElementById('root')!).render(<App />);
