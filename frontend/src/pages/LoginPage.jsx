import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInUser, signInWithGoogle, resetPassword } from '../services/authService';
import '../styles/LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        if (urlParams.get('error') === 'google_auth_failed') {
            setError('Google authentication failed. Please try again.');
        }
    }, [location]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

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
            const { error: authError } = await signInUser(email, password);

            if (authError) {
                setError(authError);
            } else {
                navigate('/');
            }
        } catch {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');

        try {
            const { user, error: authError } = await signInWithGoogle();

            if (authError) {
                setError(authError);
            } else if (user) {
                navigate('/');
            }
        } catch {
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
            const { error: authError } = await resetPassword(email);

            if (authError) {
                setError(authError);
            } else {
                alert('Password reset email sent. Check your inbox.');
            }
        } catch {
            setError('Failed to send password reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page ds-page-enter">
            <main className="auth-main">
                <div className="auth-inner">
                    <div className="auth-brand">
                        <span className="auth-brand-text">Blinky</span>
                    </div>

                    <div className="auth-card">
                        <header className="auth-card-header">
                            <h1 className="auth-title">Welcome back.</h1>
                            <p className="auth-subtitle">Continue to the intelligence dashboard.</p>
                        </header>

                        {error && <p className="auth-error" role="alert">{error}</p>}

                        <form className="auth-form" onSubmit={handleLogin}>
                            <div className="ds-input-group">
                                <label htmlFor="login-email">Email address</label>
                                <input
                                    id="login-email"
                                    className="ds-input"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="ds-input-group">
                                <div className="auth-label-row">
                                    <label htmlFor="login-password">Password</label>
                                    <button
                                        type="button"
                                        className="auth-link-btn"
                                        onClick={handleForgotPassword}
                                        disabled={loading}
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <input
                                    id="login-password"
                                    className="ds-input"
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="auth-actions">
                                <button type="submit" className="ds-btn-primary" disabled={loading}>
                                    {loading ? 'Signing in…' : 'Sign in'}
                                </button>
                            </div>
                        </form>

                        <p className="auth-alt">Or continue with</p>
                        <button
                            type="button"
                            className="auth-google"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                        >
                            <img src="https://img.icons8.com/color/20/000000/google-logo.png" alt="" />
                            {loading ? 'Signing in…' : 'Google'}
                        </button>

                        <p className="auth-foot">
                            Don&apos;t have an account?{' '}
                            <Link to="/signup" className="auth-inline-link">Create account</Link>
                        </p>
                    </div>

                    <div className="auth-decoration" aria-hidden="true">
                        <span /><span /><span />
                    </div>
                </div>
            </main>

            <footer className="auth-footer">
                <span className="auth-footer-brand">Blinky</span>
                <div className="auth-footer-links">
                    <a href="#">Terms</a>
                    <a href="#">Privacy</a>
                </div>
                <p className="auth-footer-copy">© {new Date().getFullYear()} Blinky Intelligence.</p>
            </footer>
        </div>
    );
};

export default LoginPage;
