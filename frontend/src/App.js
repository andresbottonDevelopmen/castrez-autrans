import { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from '@/components/ui/sonner';
import HomePage from '@/pages/HomePage';
import RecambiosPage from '@/pages/RecambiosPage';
import CitasPage from '@/pages/CitasPage';
import NosotrosPage from '@/pages/NosotrosPage';
import AdminPage from '@/pages/AdminPage';
import AttendancePage from '@/pages/AttendancePage';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/recambios" element={<RecambiosPage />} />
            <Route path="/citas" element={<CitasPage />} />
            <Route path="/nosotros" element={<NosotrosPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="/asistencia" element={<AttendancePage />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
