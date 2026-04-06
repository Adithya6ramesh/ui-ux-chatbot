import { Link } from 'react-router-dom';
import '../styles/FeaturesPage.css';

const FEATURES = [
    {
        title: 'AI Design Authenticity Scan',
        body: 'Detect whether your interface feels engineered or artificially generated. Blinky surfaces hidden patterns that reveal AI-driven design behaviors.',
    },
    {
        title: 'UX Depth Analysis',
        body: 'Go beyond visuals — understand how your product actually thinks. Evaluate flows, edge cases, and real user journey intelligence. You can download the report in PDF format after each analysis.',
    },
    {
        title: 'Consistency & System Audit',
        body: 'Expose the strength of your design system beneath the surface. From spacing logic to component harmony, nothing goes unnoticed.',
    },
];

export default function FeaturesPage() {
    return (
        <main className="features-page">
            <section className="features-hero" aria-labelledby="features-heading">
                <p className="features-kicker">Features</p>
                <h1 id="features-heading" className="features-title">
                    What Blinky delivers
                </h1>
                <p className="features-lead">
                    Editorial-grade critique, structured metrics, and exportable reports — built for teams who care how interfaces feel in the wild.
                </p>
            </section>

            <div className="features-grid">
                {FEATURES.map((f, i) => (
                    <article
                        key={f.title}
                        className={`features-col features-col--${i === 1 ? 'mid' : i === 0 ? 'left' : 'right'}`}
                    >
                        <div className="features-rule" aria-hidden />
                        <h2 className="features-col-title">{f.title}</h2>
                        <p className="features-col-body">{f.body}</p>
                    </article>
                ))}
            </div>

            <p className="features-cta-wrap">
                <Link to="/" className="features-cta">
                    Back to home
                </Link>
            </p>
        </main>
    );
}
