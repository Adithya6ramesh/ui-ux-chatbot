import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInUser, signInWithGoogle, resetPassword } from '../services/authService';
import './../styles/LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check for Google auth error in URL parameters
        const urlParams = new URLSearchParams(location.search);
        if (urlParams.get('error') === 'google_auth_failed') {
            setError('Google authentication failed. Please try again.');
        }
    }, [location]);

    const handleLogin = async () => {
        // Clear previous errors
        setError('');

        // Validate form
        if (!email.trim()) {
            setError('Please enter your email');
            return;
        }
        if (!password.trim()) {
            setError('Please enter your password');
            return;
        }
        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            const { user, error } = await signInUser(email, password);
            
            if (error) {
                setError(error);
            } else {
                // Successfully logged in
                navigate('/');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');

        try {
            console.log('Initiating Google sign-in...');
            const { user, error } = await signInWithGoogle();
            
            if (error) {
                setError(error);
            } else if (user) {
                // Successfully logged in with Google
                navigate('/');
            }
        } catch (err) {
            console.error('Google login error:', err);
            setError('Google login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            setError('Please enter your email address to reset password');
            return;
        }
        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { error } = await resetPassword(email);
            
            if (error) {
                setError(error);
            } else {
                alert('Password reset email sent! Check your inbox.');
            }
        } catch (err) {
            setError('Failed to send password reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-page">
                <div className="login-container">
                    <h2>Welcome Back!</h2>
                    <p>Please log in to continue</p>
                    {error && <p className="error-message">{error}</p>}
                    <div className="login-form">
                        <input 
                            type="email" 
                            placeholder="Email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                        <button 
                            className="btn-login" 
                            onClick={handleLogin}
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                        <p className="forgot-password">
                            <span 
                                onClick={handleForgotPassword} 
                                style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                            >
                                Forgot Password?
                            </span>
                        </p>
                    </div>
                    {/* Google Sign-In with redirect method */}
                    {true && (
                        <>
                            <div className="divider">
                                <span>OR</span>
                            </div>
                            <div className="social-login">
                                <button 
                                    className="btn-google" 
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                >
                                    <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google" />
                                    {loading ? 'Signing in...' : 'Login with Google'}
                                </button>
                            </div>
                        </>
                    )}
                    <p className="signup-link">
                        Don't have an account? <Link to="/signup">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage; 