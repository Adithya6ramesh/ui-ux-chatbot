import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '../firebase';

const GoogleAuthHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                // Check for any pending redirect results (edge cases)
                const result = await getRedirectResult(auth);
                
                if (result) {
                    // User signed in successfully via redirect
                    console.log('Google sign-in successful via redirect:', result.user);
                    navigate('/', { replace: true });
                }
            } catch (error) {
                console.error('Google redirect error:', error);
                // Only navigate to login if we're not already there
                if (location.pathname !== '/login') {
                    navigate('/login?error=google_auth_failed', { replace: true });
                }
            }
        };

        // Check for redirect results (mainly for edge cases now)
        handleRedirectResult();
    }, [navigate, location]);

    return null; // This component doesn't render anything
};

export default GoogleAuthHandler; 