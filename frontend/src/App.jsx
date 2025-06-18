import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage'; // Assuming you have this
import PricingPage from './pages/PricingPage';
import ProtectedRoute from './components/ProtectedRoute';
import GoogleAuthHandler from './components/GoogleAuthHandler';
import Header from './components/Header';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <GoogleAuthHandler />
                <div className="App">
                    <Routes>
                        {/* Home page as default route */}
                        <Route path="/" element={
                            <>
                                <Header />
                                <HomePage />
                            </>
                        } />
                        
                        {/* Auth pages */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignUpPage />} />
                        <Route path="/pricing" element={<PricingPage />} />

                        {/* Protected authenticated home route - kept for compatibility */}
                        <Route path="/home" element={
                            <ProtectedRoute>
                                <>
                                    <Header />
                                    <HomePage />
                                </>
                            </ProtectedRoute>
                        } />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App; 