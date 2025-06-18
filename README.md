# Blinky - The AI-Powered UI/UX Analyzer

Blinky is a smart UI/UX analyzer chatbot designed to help designers and developers improve their user interfaces. By uploading a design image, users can receive expert-level analysis based on established UI/UX principles. This version features a beautiful custom design with premium typography, modern interface, and **integrated server architecture**.

## ✨ Features

-   **AI-Powered Analysis**: Leverages Google Gemini to analyze UI designs with detailed feedback.
-   **Secure API Key Handling**: API key is managed securely on the backend via an environment file.
-   **Complete Authentication System**: 
    - Clean login/signup system with modern design aesthetics
    - Google OAuth integration with popup-based authentication
    - Login modal for non-authenticated users
    - Automatic authentication state management
-   **Pricing Page**: Professional pricing plans with modern card-based design
-   **Logo Integration**: Custom logo positioned in top-left corner with brand title
-   **Integrated Server**: Single Flask server serves both frontend and backend for simplified deployment.
-   **Custom Design System**: 
    - **Typography**: Lobster font for branding, Playfair Display for elegant text, DM Serif Display for buttons
    - **Custom Frame**: Beautiful rounded frame design for upload interface
    - **Professional UI**: Black and white color scheme with custom background
-   **Image Upload Interface**: Intuitive drag-and-drop style upload with custom icons.
-   **Detailed Feedback**: Comprehensive analysis including ratings, strengths, weaknesses, and actionable suggestions.
-   **Responsive Design**: Optimized for various screen sizes and devices.
-   **Client-Side Routing**: Smooth navigation using React Router.
-   **Smart Authentication Flow**: Home page first, login prompts when needed.

## 🎨 Design Features

- **Premium Typography**: 
  - Lobster font for "Blinky" branding
  - Playfair Display for taglines and navigation elements
  - DM Serif Display for action buttons
  - Poppins for body text
- **Logo & Branding**: Custom logo with brand title in top-left corner
- **Navigation System**: Dynamic header showing pricing and authentication options
- **Login Modal**: Professional popup modal for authentication prompts
- **Pricing Cards**: Modern card-based pricing layout with hover effects
- **Custom Frame Design**: Upload interface with beautiful rounded frame
- **Professional Color Scheme**: Clean black and white aesthetic
- **Background Design**: Custom full-page background for immersive experience
- **Modern Icons**: Custom SVG upload icons for better user experience

## 🏗️ Architecture

This application uses an **integrated server architecture**:
- **Single Flask Server**: Serves both React frontend (as static files) and handles API requests
- **No Proxy Needed**: Frontend and backend run on the same port (5000)
- **Simplified Deployment**: One server to manage instead of two separate services
- **Smart Routing**: Home page as landing page with authentication prompts when needed

## 📂 Project Structure

```
.
├── api/
│   ├── .env.example       # Example for environment variables
│   ├── index.py           # Integrated Flask server (frontend + backend)
│   └── prompt.txt         # The knowledge base for the AI
│
├── frontend/
│   ├── src/
│   │   ├── assets/        # Images and design assets
│   │   │   ├── bg.png     # Custom frame design
│   │   │   ├── bgful.png  # Full page background
│   │   │   └── logo.png   # Custom logo
│   │   ├── pages/
│   │   │   ├── HomePage.jsx     # Main upload and analysis page
│   │   │   ├── LoginPage.jsx    # Authentication page
│   │   │   ├── SignUpPage.jsx   # User registration page
│   │   │   └── PricingPage.jsx  # Pricing plans page
│   │   ├── components/
│   │   │   ├── Header.jsx           # Dynamic navigation header
│   │   │   ├── GoogleAuthHandler.jsx # Google OAuth handling
│   │   │   └── ProtectedRoute.jsx   # Route protection
│   │   ├── services/
│   │   │   └── authService.js   # Authentication with Firebase
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx  # Authentication state management
│   │   ├── styles/
│   │   │   ├── LoginPage.css
│   │   │   ├── SignUpPage.css
│   │   │   └── PricingPage.css
│   │   ├── App.jsx        # Main component with routing
│   │   ├── App.css        # Main styling with custom design system
│   │   └── main.jsx       # React entry point
│   ├── dist/              # Built frontend files (served by Flask)
│   ├── vite.config.js     # Vite config for development
│   └── package.json       # Frontend dependencies
│
├── .gitignore
├── README.md
└── requirements.txt
```

## 🚀 Getting Started

### Prerequisites

-   [Python 3](https://www.python.org/downloads/) and `pip`
-   A **Gemini API Key** from [Google AI Studio](https://makersuite.google.com/app/apikey)
-   **Firebase Project** for authentication (optional - see configuration)
-   [Node.js](https://nodejs.org/) (only needed for frontend development)

### ⚡ Quick Start (Recommended)

**The fastest way to run your application:**

1.  **Clone and Setup:**
    ```bash
    git clone https://github.com/Adithya6ramesh/ui-ux-chatbot.git
    cd ui-ux-chatbot
    ```

2.  **Configure API Key:**
    ```bash
    cd api
    copy .env.example .env  # Windows
    # cp .env.example .env  # macOS/Linux
    ```
    Edit `.env` file and add your Gemini API key:
    ```
    GEMINI_API_KEY="your_actual_gemini_api_key_here"
    ```

3.  **Configure Firebase (Optional):**
    Create `frontend/.env` file with your Firebase config:
    ```
    VITE_FIREBASE_API_KEY=your_firebase_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Install Dependencies:**
    ```bash
    cd ..  # Back to root directory
    pip install -r requirements.txt
    ```

5.  **Start the Application:**
    ```bash
    cd api
    python index.py
    ```

6.  **Access Your App:**
    Open your browser and go to: **`http://localhost:5000`**

**That's it!** 🎉 Your complete application is running on **port 5000** with both frontend and backend integrated.

---

### 🛠 Advanced Development Setup

**Only needed if you want to modify the frontend code:**

1.  **Follow steps 1-4 above**

2.  **Install Frontend Dependencies:**
    ```bash
    npm install --prefix frontend
    ```

3.  **Build Frontend (after making changes):**
    ```bash
    npm run build --prefix frontend
    ```

4.  **Restart the Server:**
    ```bash
    cd api
    python index.py
    ```
    Access: **`http://localhost:5000`**

### 🔧 Alternative: Separate Development Servers

**Only for advanced development with live reload:**

```bash
# Terminal 1: Backend
cd api
python index.py

# Terminal 2: Frontend (for live changes)
cd frontend
npm run dev
# This will run on http://localhost:5173 with live reload
```

**Note:** Use `localhost:5000` for the integrated experience, or `localhost:5173` only when using separate development servers.

## 🎯 Application Flow

1.  **Home Page**: Landing page with logo, branding, and upload interface:
    - Custom logo and "Blinky" title in top-left corner
    - "Pricing" and "Sign In" buttons in top-right
    - Main tagline: "Know your design. Inside out"
    - Sub-tagline: "AI-powered insights to perfect your UI and deliver user-first experiences"
    - Upload interface with custom styling

2.  **Authentication Flow**:
    - **Not logged in**: Login modal appears when trying to analyze files
    - **Login Page**: Email/password and Google OAuth options
    - **Sign Up Page**: User registration with Google OAuth
    - **Logged in**: Pricing and Logout buttons in header

3.  **Pricing Page**: Professional pricing plans with feature comparisons:
    - Free Plan: Basic analysis, 5 analyses, standard feedback
    - Pro Plan: Advanced analysis, 60 analyses per month, detailed insights

4.  **Analysis**: Upload UI/UX designs and get comprehensive AI-powered feedback
5.  **Navigation**: Dynamic header with authentication-aware navigation

## 🔧 Configuration

### Authentication Setup

The application uses Firebase for authentication. To set up:

1. **Create Firebase Project**: Go to [Firebase Console](https://console.firebase.google.com)
2. **Enable Authentication**: 
   - Go to Authentication → Sign-in method
   - Enable Email/Password and Google providers
3. **Configure Authorized Domains**: Add your domain to authorized domains
4. **Get Configuration**: Copy your config to `frontend/.env`

### Google OAuth Setup

For Google sign-in to work properly:

1. **Firebase Console**: Enable Google provider in Authentication
2. **Google Cloud Console**: 
   - Add your domain to "Authorized JavaScript origins"
   - Add redirect URIs to "Authorized redirect URIs"
3. **Browser Settings**: Allow popups for your domain

## 🛠 Development Notes

- **Integrated Architecture**: Single Flask server handles everything
- **Authentication**: Firebase-based with Google OAuth support
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Error Handling**: Comprehensive error handling for authentication and API calls
- **Security**: API keys stored securely on backend, Firebase config in environment variables

## 🎨 Customization

- **Logo**: Replace `frontend/src/assets/logo.png` with your custom logo
- **Branding**: Update the "Blinky" title and taglines in `Header.jsx`
- **Colors**: Modify the color scheme in `App.css`
- **Typography**: Change fonts by updating Google Fonts imports in `index.html`
- **Pricing**: Update pricing plans in `PricingPage.jsx`

## 📝 API Reference

### Analyze Endpoint
```
POST /api/analyze
Content-Type: multipart/form-data

Body:
- file: Image file (JPEG, PNG, etc.)

Response:
- analysis: String containing the AI analysis
```

## 🐛 Troubleshooting

### Common Issues

1. **Google Sign-in Issues**:
   - Check Firebase configuration
   - Verify authorized domains
   - Allow popups in browser

2. **API Analysis Errors**:
   - Verify Gemini API key in `api/.env`
   - Check API key validity
   - Ensure backend server is running

3. **Build Issues**:
   - Clear `frontend/dist` and rebuild
   - Check Node.js version compatibility
   - Verify all dependencies are installed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Build frontend: `npm run build --prefix frontend`
5. Test the integrated server: `cd api && python index.py`
6. Commit your changes: `git commit -m 'Add feature'`
7. Push to the branch: `git push origin feature-name`
8. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Blinky** - Making UI/UX analysis intelligent and accessible! 🎨✨ 