import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUser, signInWithGoogle } from '../services/authService';
import './../styles/SignUpPage.css';

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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSignUp = async () => {
        setError('');

        // Validate form
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
            const { user, error } = await createUser(formData.email, formData.password);
            
            if (error) {
                setError(error);
            } else {
                // Successfully created account
                navigate('/');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setLoading(true);
        setError('');

        try {
            const { user, error } = await signInWithGoogle();
            
            if (error) {
                setError(error);
            } else if (user) {
                // Successfully signed up with Google
                navigate('/');
            }
        } catch (err) {
            setError('Google sign up failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-container">
                <h2>Create Account</h2>
                <p>Get started with your new account</p>
                {error && <p className="error-message">{error}</p>}
                <div className="signup-form">
                    <input 
                        type="text" 
                        name="fullName"
                        placeholder="Full Name" 
                        value={formData.fullName}
                        onChange={handleInputChange}
                        disabled={loading}
                    />
                    <input 
                        type="email" 
                        name="email"
                        placeholder="Email" 
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={loading}
                    />
                    <input 
                        type="password" 
                        name="password"
                        placeholder="Password" 
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={loading}
                    />
                    <input 
                        type="password" 
                        name="confirmPassword"
                        placeholder="Confirm Password" 
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={loading}
                    />
                    <button 
                        className="btn-signup" 
                        onClick={handleSignUp}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </div>
                {/* Google Sign-Up with redirect method */}
                {true && (
                    <>
                        <div className="divider">
                            <span>OR</span>
                        </div>
                        <div className="social-signup">
                            <button 
                                className="btn-google" 
                                onClick={handleGoogleSignUp}
                                disabled={loading}
                            >
                                <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google" />
                                {loading ? 'Signing up...' : 'Sign Up with Google'}
                            </button>
                        </div>
                    </>
                )}
                <p className="login-link">
                    Already have an account? <Link to="/login">Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default SignUpPage; 