import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOutUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Header = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOutUser();
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <header className="App-header">
            <div className="logo-container">
                <img src={logo} alt="Logo" className="logo-corner" />
                <h1>Blinky</h1>
            </div>
            <div className="header-links">
                <Link to="/pricing" className="pricing-link-corner">Pricing</Link>
                {currentUser ? (
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                ) : (
                    <Link to="/login" className="signup-link-corner">Sign In</Link>
                )}
            </div>
            <div className="taglines">
                <p className="main-tagline">Know your design. Inside out</p>
                <p className="sub-tagline">AI-powered insights to perfect your UI and deliver user-first experiences.</p>
            </div>
        </header>
    );
};

export default Header; 