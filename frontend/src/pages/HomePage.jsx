import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';

function HomePage() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            setShowLoginModal(true);
            return;
        }

        if (!file) {
            setError('Please upload a file first.');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(API_ENDPOINTS.analyze, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 180000,
            });

            const structured = res.data?.structured;
            if (!structured) {
                setError(
                    res.data?.error ||
                        'Unexpected response from server. Ensure the API returns structured JSON.',
                );
                setLoading(false);
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                setLoading(false);
                navigate('/result', {
                    state: {
                        structured,
                        previewDataUrl: reader.result,
                        fileName: file.name,
                    },
                });
            };
            reader.onerror = () => {
                setError('Could not read the file for preview.');
                setLoading(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            const errorMessage =
                err.response?.data?.error ||
                (err.code === 'ECONNABORTED'
                    ? 'Analysis timed out. Try a smaller image or try again.'
                    : 'An error occurred during analysis. Please try again.');
            setError(errorMessage);
            console.error(err);
            setLoading(false);
        }
    };

    const handleLoginRedirect = () => {
        setShowLoginModal(false);
        navigate('/login');
    };

    const closeModal = () => {
        setShowLoginModal(false);
    };

    return (
        <>
            <main id="home">
                <form onSubmit={handleSubmit} className="upload-panel">
                    <p className="choose-file-text">Choose your file</p>
                    <div className="upload-section">
                        <div className="file-input-wrapper">
                            <input type="file" id="file" onChange={handleFileChange} />
                            <label htmlFor="file" className="file-input-label">
                                {file ? (
                                    <span className="file-name">{file.name}</span>
                                ) : (
                                    <div className="upload-icon-container">
                                        <svg
                                            className="upload-icon"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            aria-hidden
                                        >
                                            <path
                                                d="M12 4v12m0 0l-4-4m4 4l4-4"
                                                stroke="currentColor"
                                                strokeWidth="1.75"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M5 19h14"
                                                stroke="currentColor"
                                                strokeWidth="1.75"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </label>
                        </div>
                        <button type="submit" className="btn-analyze" disabled={loading}>
                            {loading ? 'Analyzing…' : 'Analyze design'}
                        </button>
                    </div>
                </form>
                {error && <p className="error-message">{error}</p>}
            </main>

            {showLoginModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Login Required</h3>
                        <p>Please login to analyze your designs and get AI-powered insights.</p>
                        <div className="modal-buttons">
                            <button type="button" onClick={handleLoginRedirect} className="btn-login-modal">
                                Login
                            </button>
                            <button type="button" onClick={closeModal} className="btn-cancel-modal">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default HomePage;
