import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import JobDetail from './pages/JobDetail/JobDetail';
import PostJob from './pages/PostJob/PostJob';
import MyJobs from './pages/MyJobs/MyJobs';
import Applications from './pages/Applications/Applications';

function PrivateRoute({ children }) {
  const { user } = useSelector(s => s.auth);
  return user ? children : <Navigate to="/login" replace />;
}

function EmployerRoute({ children }) {
  const { user } = useSelector(s => s.auth);
  return user?.role === 'employer' || user?.role === 'admin' ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/job/:id" element={<JobDetail />} />
        <Route path="/post-job" element={<EmployerRoute><PostJob /></EmployerRoute>} />
        <Route path="/my-jobs" element={<EmployerRoute><MyJobs /></EmployerRoute>} />
        <Route path="/applications" element={<PrivateRoute><Applications /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
