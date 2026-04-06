import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUser, signInWithGoogle } from '../services/authService';
import '../styles/LoginPage.css';
import '../styles/SignUpPage.css';

const SignUpPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.fullName.trim()) {
            setError('Please enter your full name');
            return;
        }
        if (!formData.email.trim()) {
            setError('Please enter your email');
            return;
        }
        if (!formData.email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }
        if (!formData.password.trim()) {
            setError('Please enter a password');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const { error: authError } = await createUser(formData.email, formData.password);

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

    const handleGoogleSignUp = async () => {
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
            setError('Google sign up failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page signup-page ds-page-enter">
            <main className="auth-main">
                <div className="auth-inner auth-inner-wide">
                    <div className="auth-brand">
                        <span className="auth-brand-text">Blinky</span>
                    </div>

                    <div className="auth-card">
                        <header className="auth-card-header">
                            <h1 className="auth-title">Create your account.</h1>
                            <p className="auth-subtitle">Join the intelligence dashboard.</p>
                        </header>

                        {error && <p className="auth-error" role="alert">{error}</p>}

                        <form className="auth-form" onSubmit={handleSignUp}>
                            <div className="ds-input-group">
                                <label htmlFor="signup-name">Full name</label>
                                <input
                                    id="signup-name"
                                    name="fullName"
                                    className="ds-input"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Jane Doe"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="ds-input-group">
                                <label htmlFor="signup-email">Email address</label>
                                <input
                                    id="signup-email"
                                    name="email"
                                    className="ds-input"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="ds-input-group">
                                <label htmlFor="signup-password">Password</label>
                                <input
                                    id="signup-password"
                                    name="password"
                                    className="ds-input"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="ds-input-group">
                                <label htmlFor="signup-confirm">Confirm password</label>
                                <input
                                    id="signup-confirm"
                                    name="confirmPassword"
                                    className="ds-input"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="auth-actions">
                                <button type="submit" className="ds-btn-primary" disabled={loading}>
                                    {loading ? 'Creating account…' : 'Sign up'}
                                </button>
                            </div>
                        </form>

                        <p className="auth-alt">Or continue with</p>
                        <button
                            type="button"
                            className="auth-google"
                            onClick={handleGoogleSignUp}
                            disabled={loading}
                        >
                            <img src="https://img.icons8.com/color/20/000000/google-logo.png" alt="" />
                            {loading ? 'Signing up…' : 'Google'}
                        </button>

                        <p className="auth-foot">
                            Already have an account?{' '}
                            <Link to="/login" className="auth-inline-link">Sign in</Link>
                        </p>
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

export default SignUpPage;
