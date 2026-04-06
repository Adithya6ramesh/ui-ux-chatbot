import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/PricingPage.css';

const PricingPage = () => {
    return (
        <div className="pricing-page ds-page-enter">
            <header className="pricing-nav">
                <Link to="/" className="pricing-nav-brand">Blinky</Link>
                <Link to="/login" className="pricing-nav-link">Sign in</Link>
            </header>

            <div className="pricing-container">
                <header className="pricing-header">
                    <h1>Choose your plan</h1>
                    <p>Select the tier that matches your design analysis workflow.</p>
                </header>

                <div className="pricing-cards">
                    <article className="pricing-card">
                        <div className="card-header">
                            <h2>Free</h2>
                            <p className="card-description">
                                For individuals or small teams getting started with Blinky.
                            </p>
                        </div>

                        <div className="price-section">
                            <div className="price">Free</div>
                        </div>

                        <Link to="/signup" className="pricing-btn pricing-btn-outline">
                            Try for free
                        </Link>

                        <ul className="features">
                            <li>Basic UI/UX analysis</li>
                            <li>Five analyses included</li>
                            <li>Standard feedback</li>
                        </ul>
                    </article>

                    <article className="pricing-card pricing-card-featured">
                        <div className="popular-badge">Most popular</div>
                        <div className="card-header">
                            <h2>Pro</h2>
                            <p className="card-description">
                                Deeper analysis and richer recommendations for product teams.
                            </p>
                        </div>

                        <div className="price-section">
                            <div className="price">$9.99</div>
                            <div className="monthly-price">Billed monthly</div>
                        </div>

                        <Link to="/signup" className="pricing-btn pricing-btn-primary">
                            Try Pro
                        </Link>

                        <ul className="features">
                            <li>Advanced UI/UX analysis</li>
                            <li>Up to 60 analyses per month</li>
                            <li>Detailed insights and recommendations</li>
                        </ul>
                    </article>
                </div>

                <div className="back-home">
                    <Link to="/">← Back to home</Link>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
