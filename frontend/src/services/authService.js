import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged 
} from "firebase/auth";
import { auth } from '../firebase';

// Development mode flag (set to false when Firebase is properly configured)
const DEV_MODE = false; // Set to true for testing without Firebase setup

// Mock user for development
const mockUser = {
  uid: 'mock-user-id',
  email: 'test@example.com',
  displayName: 'Test User'
};

// Create a new user with email and password
export const createUser = async (email, password) => {
  if (DEV_MODE) {
    // Mock success for development
    return { user: { ...mockUser, email }, error: null };
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error('Create user error:', error);
    let errorMessage = error.message;
    
    // Provide user-friendly error messages
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    }
    
    return { user: null, error: errorMessage };
  }
};

// Sign in with email and password
export const signInUser = async (email, password) => {
  if (DEV_MODE) {
    // Mock success for development
    if (email && password) {
      const user = { ...mockUser, email };
      
      // Store user in sessionStorage to persist across page reloads
      sessionStorage.setItem('mockAuthUser', JSON.stringify(user));
      
      // Trigger auth state change if callback exists  
      if (window.authCallback) {
        setTimeout(() => window.authCallback(user), 100);
      }
      
      return { user, error: null };
    } else {
      return { user: null, error: 'Please enter email and password' };
    }
  }
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    let errorMessage = error.message;
    
    // Provide user-friendly error messages
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    }
    
    return { user: null, error: errorMessage };
  }
};

// Sign out the current user
export const signOutUser = async () => {
  if (DEV_MODE) {
    // Clear stored user from sessionStorage
    sessionStorage.removeItem('mockAuthUser');
    
    // Trigger auth state change to null (signed out)
    if (window.authCallback) {
      setTimeout(() => window.authCallback(null), 100);
    }
    
    return { error: null };
  }
  
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: error.message };
  }
};

// Sign in with Google using popup (to avoid tracking protection issues)
export const signInWithGoogle = async () => {
  if (DEV_MODE) {
    // Mock Google sign-in success - but only when this function is called
    const googleUser = {
      uid: 'google-user-id',
      email: 'user@gmail.com',
      displayName: 'Google User',
      photoURL: 'https://via.placeholder.com/100'
    };
    
    // Store user in sessionStorage to persist across page reloads
    sessionStorage.setItem('mockAuthUser', JSON.stringify(googleUser));
    
    // Trigger auth state change if callback exists
    if (window.authCallback) {
      setTimeout(() => window.authCallback(googleUser), 100);
    }
    
    return { user: googleUser, error: null };
  }
  
  try {
    const provider = new GoogleAuthProvider();
    
    // Add additional scopes if needed
    provider.addScope('email');
    provider.addScope('profile');
    
    // Configure provider settings to help with tracking protection and COOP
    provider.setCustomParameters({
      prompt: 'select_account',
      // Add this to help with COOP issues
      hd: undefined // Removes domain hint that can cause COOP issues
    });
    
    // Use popup method - suppress the COOP warning by catching it
    let result;
    try {
      result = await signInWithPopup(auth, provider);
    } catch (popupError) {
      // If it's just a COOP warning but auth succeeded, check auth state
      if (popupError.message.includes('Cross-Origin-Opener-Policy') || 
          popupError.message.includes('window.closed')) {
        // Wait a moment and check if user is actually signed in
        await new Promise(resolve => setTimeout(resolve, 1000));
        const currentUser = auth.currentUser;
        if (currentUser) {
          return { user: currentUser, error: null };
        }
      }
      throw popupError; // Re-throw if it's a real error
    }
    
    return { user: result.user, error: null };
    
  } catch (error) {
    console.error('Google sign in error:', error);
    let errorMessage = error.message;
    
    // Don't show COOP errors to users as they're just warnings
    if (error.message.includes('Cross-Origin-Opener-Policy') || 
        error.message.includes('window.closed')) {
      // Check if user is actually signed in despite the warning
      const currentUser = auth.currentUser;
      if (currentUser) {
        return { user: currentUser, error: null };
      }
      errorMessage = 'Authentication completed, but there was a browser security warning.';
    } else if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in was cancelled.';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup was blocked by browser. Please allow popups for this site and try again.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = 'Only one popup request is allowed at a time.';
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Google sign-in is not enabled. Please contact support.';
    }
    
    return { user: null, error: errorMessage };
  }
};

// Listen to authentication state changes
export const onAuthStateChange = (callback) => {
  if (DEV_MODE) {
    // Mock state change - start with NO user (not authenticated)
    // Store the callback for later use when user actually signs in
    window.authCallback = callback;
    
    // Check if user is already signed in (stored in sessionStorage)
    const storedUser = sessionStorage.getItem('mockAuthUser');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    
    // Initially call with current user state (null if not signed in)
    setTimeout(() => callback(currentUser), 100);
    
    // Return unsubscribe function
    return () => {
      window.authCallback = null;
    };
  }
  
  return onAuthStateChanged(auth, callback);
};

// Send password reset email
export const resetPassword = async (email) => {
  if (DEV_MODE) {
    return { error: null };
  }
  
  try {
    const { sendPasswordResetEmail } = await import('firebase/auth');
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    console.error('Password reset error:', error);
    let errorMessage = error.message;
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address.';
    }
    
    return { error: errorMessage };
  }
};

// Get current user
export const getCurrentUser = () => {
  if (DEV_MODE) {
    // Check sessionStorage for stored user
    const storedUser = sessionStorage.getItem('mockAuthUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }
  return auth.currentUser;
}; 