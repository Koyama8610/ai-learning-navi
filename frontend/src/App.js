import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import TicketsPage from './pages/TicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      <Header />
      <main className="max-w-4xl mx-auto p-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/tickets" 
            element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} 
          />
          <Route 
            path="/tickets/:id" 
            element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;