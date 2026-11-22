import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App.tsx';
import { MarketProvider } from './context/MarketContext';
import { LandingPage } from './pages/LandingPage';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MarketProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<App />} />
        </Routes>
      </MarketProvider>
    </BrowserRouter>
  </StrictMode>
);
