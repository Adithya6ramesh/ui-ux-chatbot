import React from 'react';
import { Link, NavLink } from 'react-router-dom';
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
            <div className="editorial-top-row">
                <Link to="/" className="logo-container">
                    <img src={logo} alt="" className="logo-corner" />
                    <span className="brand-wordmark">Blinky</span>
                </Link>
                <nav className="header-links" aria-label="Primary">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `pricing-link-corner${isActive ? ' header-nav-link--active' : ''}`
                        }
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/features"
                        className={({ isActive }) =>
                            `pricing-link-corner${isActive ? ' header-nav-link--active' : ''}`
                        }
                    >
                        Features
                    </NavLink>
                    {currentUser ? (
                        <button type="button" onClick={handleLogout} className="logout-btn">
                            Log out
                        </button>
                    ) : (
                        <Link to="/login" className="signup-link-corner">Sign in</Link>
                    )}
                </nav>
            </div>
            <div className="taglines">
                <p className="main-tagline">Know your design. Inside out.</p>
                <p className="sub-tagline">AI-powered insights to refine your UI and deliver user-first experiences.</p>
            </div>
        </header>
    );
};

export default Header; 