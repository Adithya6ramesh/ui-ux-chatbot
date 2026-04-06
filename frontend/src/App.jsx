import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage'; // Assuming you have this
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import ProtectedRoute from './components/ProtectedRoute';
import GoogleAuthHandler from './components/GoogleAuthHandler';
import Header from './components/Header';
import ResultPage from './pages/ResultPage';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <GoogleAuthHandler />
                <div className="App">
                    <div className="ds-ambient-bg" aria-hidden="true" />
                    <Routes>
                        <Route path="/" element={
                            <div className="app-shell">
                                <Header />
                                <HomePage />
                            </div>
                        } />

                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignUpPage />} />
                        <Route path="/pricing" element={<PricingPage />} />
                        <Route
                            path="/features"
                            element={
                                <div className="app-shell">
                                    <Header />
                                    <FeaturesPage />
                                </div>
                            }
                        />

                        <Route path="/result" element={<ResultPage />} />

                        <Route path="/home" element={
                            <ProtectedRoute>
                                <div className="app-shell">
                                    <Header />
                                    <HomePage />
                                </div>
                            </ProtectedRoute>
                        } />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App; 