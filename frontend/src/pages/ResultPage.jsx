import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ResultPage.css';
import { downloadAnalysisPdf } from '../utils/analysisPdf';

const STORAGE_KEY = 'blinky_last_analysis';

function clampPct(n) {
    const x = Number(n);
    if (Number.isNaN(x)) return 0;
    return Math.min(100, Math.max(0, Math.round(x)));
}

function pickNum(obj, keys) {
    for (const k of keys) {
        if (obj && obj[k] != null && obj[k] !== '') {
            const n = Number(obj[k]);
            if (!Number.isNaN(n)) return n;
        }
    }
    return null;
}

function normalizeStructured(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const scoresIn = raw.scores && typeof raw.scores === 'object' ? raw.scores : {};
    const ai = raw.ai_analysis && typeof raw.ai_analysis === 'object' ? raw.ai_analysis : {};

    const usability = pickNum(scoresIn, ['usability', 'Usability', 'usability_percent', 'usability_score'])
        ?? pickNum(raw, ['usability', 'Usability', 'usability_percent']);
    const visualBalance = pickNum(scoresIn, [
        'visual_balance',
        'VisualBalance',
        'visual_balance_percent',
        'visual_balance_score',
    ]) ?? pickNum(raw, ['visual_balance', 'VisualBalance']);
    const accessibility = pickNum(scoresIn, [
        'accessibility',
        'Accessibility',
        'accessibility_percent',
        'accessibility_score',
    ]) ?? pickNum(raw, ['accessibility', 'Accessibility']);

    function toPct(v) {
        if (v == null || Number.isNaN(Number(v))) return 0;
        let n = Number(v);
        if (n <= 10) n *= 10;
        return clampPct(n);
    }

    const su = toPct(usability);
    const sv = toPct(visualBalance);
    const sa = toPct(accessibility);

    let rating = raw.rating && typeof raw.rating === 'object' ? { ...raw.rating } : {};
    let scoreVal = rating.score != null ? Number(rating.score) : NaN;
    if (Number.isNaN(scoreVal)) {
        scoreVal = pickNum(raw, ['overall_score', 'final_score', 'OverallScore', 'FinalScore']);
        if (scoreVal != null) {
            if (scoreVal > 10) rating.score = Math.max(1, Math.min(10, Math.round(scoreVal / 10)));
            else rating.score = Math.max(1, Math.min(10, Math.round(scoreVal)));
        }
    } else {
        rating.score = Math.max(1, Math.min(10, Math.round(scoreVal)));
    }
    if (rating.score == null && (su || sv || sa)) {
        const avg = (su + sv + sa) / 3;
        rating.score = Math.max(1, Math.min(10, Math.round(avg / 10)));
    }
    if (!rating.explanation || String(rating.explanation).trim() === '') {
        const fromAlt =
            typeof raw.rating_explanation === 'string'
                ? raw.rating_explanation
                : typeof raw.rating_reason === 'string'
                  ? raw.rating_reason
                  : '';
        if (fromAlt.trim()) rating.explanation = fromAlt.trim();
    }

    let aiPct = clampPct(ai.ai_likeness_percent ?? ai.ai_usage_probability ?? ai.AI_likeness_percent);
    let humanPct = clampPct(ai.human_likeness_percent);
    if (aiPct + humanPct !== 100 && (aiPct || humanPct)) {
        const sum = aiPct + humanPct || 1;
        aiPct = Math.round((aiPct / sum) * 100);
        humanPct = 100 - aiPct;
    } else if (!humanPct && aiPct) {
        humanPct = 100 - aiPct;
    } else if (!aiPct && humanPct) {
        aiPct = 100 - humanPct;
    } else if (!aiPct && !humanPct) {
        aiPct = 50;
        humanPct = 50;
    }

    const intro =
        (typeof raw.intro_summary === 'string' && raw.intro_summary.trim()) ||
        (typeof raw.summary === 'string' && raw.summary.trim()) ||
        (typeof raw.executive_summary === 'string' && raw.executive_summary.trim()) ||
        '';

    const archSummary =
        (raw.architectural_integrity &&
            typeof raw.architectural_integrity.summary === 'string' &&
            raw.architectural_integrity.summary.trim()) ||
        (typeof raw.architectural_summary === 'string' && raw.architectural_summary.trim()) ||
        '';

    const aiSummary =
        (typeof ai.summary === 'string' && ai.summary.trim()) ||
        (typeof raw.ai_generation_analysis === 'string' && raw.ai_generation_analysis.trim()) ||
        '';

    const strengths = normalizeStrengthsList(raw.strengths ?? raw.key_strengths);
    const weaknesses = normalizeWeaknessesList(raw.weaknesses ?? raw.weaknesses_detailed);
    const suggestions = normalizeStringList(
        raw.improvement_suggestions ?? raw.suggestions ?? raw.actionable_improvements,
    );

    return {
        project_title: raw.project_title || 'Untitled_Analysis',
        intro_summary: intro,
        rating: {
            score: rating.score ?? null,
            explanation:
                rating.explanation ||
                (typeof raw.rating_explanation === 'string' ? raw.rating_explanation : '') ||
                '',
        },
        scores: {
            usability: su,
            visual_balance: sv,
            accessibility: sa,
        },
        architectural_integrity: {
            summary: archSummary || raw.architectural_integrity?.summary || '',
        },
        ai_analysis: {
            ...ai,
            ai_likeness_percent: aiPct,
            human_likeness_percent: humanPct,
            summary: aiSummary || ai.summary || '',
            categories: Array.isArray(ai.categories) ? ai.categories : [],
        },
        key_observations: Array.isArray(raw.key_observations) ? raw.key_observations : [],
        strengths,
        weaknesses,
        improvement_suggestions: suggestions,
        meta: raw.meta || {},
    };
}

function normalizeStringList(val) {
    if (!Array.isArray(val)) return [];
    const out = [];
    for (const row of val) {
        if (typeof row === 'string' && row.trim()) out.push(row.trim());
        else if (row && typeof row === 'object') {
            const t = row.text ?? row.point ?? row.title;
            if (typeof t === 'string' && t.trim()) out.push(t.trim());
        }
    }
    return out;
}

function normalizeStrengthsList(val) {
    return normalizeStringList(val);
}

function normalizeWeaknessesList(val) {
    if (!Array.isArray(val)) return [];
    const out = [];
    for (const row of val) {
        if (typeof row === 'string' && row.trim()) {
            out.push({ point: row.trim(), severity: null });
        } else if (row && typeof row === 'object') {
            const point = row.point ?? row.text ?? row.issue ?? '';
            let sev = row.severity;
            if (sev != null) {
                const n = Number(sev);
                sev = Number.isNaN(n) ? null : Math.max(1, Math.min(10, Math.round(n)));
            } else {
                sev = null;
            }
            if (typeof point === 'string' && point.trim()) {
                out.push({ point: point.trim(), severity: sev });
            }
        }
    }
    return out;
}

function loadStored() {
    try {
        const s = sessionStorage.getItem(STORAGE_KEY);
        if (!s) return null;
        const parsed = JSON.parse(s);
        return {
            structured: normalizeStructured(parsed.structured),
            previewDataUrl: parsed.previewDataUrl || null,
            fileName: parsed.fileName || '',
        };
    } catch {
        return null;
    }
}

function initialPayload(location) {
    if (location.state?.structured) {
        return {
            structured: normalizeStructured(location.state.structured),
            previewDataUrl: location.state.previewDataUrl || null,
            fileName: location.state.fileName || '',
        };
    }
    return loadStored();
}

function ObservationIcon({ tone }) {
    if (tone === 'caution') {
        return (
            <svg className="result-obs-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        );
    }
    if (tone === 'insight') {
        return (
            <svg className="result-obs-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" stroke="currentColor" strokeWidth="1.2" />
            </svg>
        );
    }
    return (
        <svg className="result-obs-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function ResultPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [payload, setPayload] = useState(() => initialPayload(location));

    useEffect(() => {
        if (location.state?.structured) {
            const next = {
                structured: normalizeStructured(location.state.structured),
                previewDataUrl: location.state.previewDataUrl || null,
                fileName: location.state.fileName || '',
            };
            setPayload(next);
            sessionStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    structured: location.state.structured,
                    previewDataUrl: location.state.previewDataUrl,
                    fileName: location.state.fileName,
                }),
            );
        }
    }, [location.state, location.key]);

    useEffect(() => {
        if (!payload?.structured) {
            navigate('/', { replace: true });
        }
    }, [payload, navigate]);

    const data = payload?.structured;
    const pieData = useMemo(() => {
        if (!data?.ai_analysis) return [];
        return [
            { name: 'AI signals', value: data.ai_analysis.ai_likeness_percent },
            { name: 'Human craft', value: data.ai_analysis.human_likeness_percent },
        ];
    }, [data]);

    const downloadReport = () => {
        if (!data) return;
        downloadAnalysisPdf(data, payload?.previewDataUrl ?? null);
    };

    if (!data) {
        return (
            <div className="result-page result-page--loading">
                <p className="result-loading-text">No analysis data. Returning home…</p>
            </div>
        );
    }

    const meta = data.meta || {};
    const w = meta.width;
    const h = meta.height;

    return (
        <div className="result-page">
            <header className="result-nav">
                <Link to="/" className="result-nav-brand">
                    Blinky
                </Link>
                <nav className="result-nav-center" aria-label="Primary">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `result-nav-link${isActive ? ' result-nav-link--active' : ''}`
                        }
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/features"
                        className={({ isActive }) =>
                            `result-nav-link${isActive ? ' result-nav-link--active' : ''}`
                        }
                    >
                        Features
                    </NavLink>
                </nav>
                <div className="result-nav-right">
                    {currentUser ? (
                        <span className="result-nav-email">{currentUser.email}</span>
                    ) : (
                        <Link to="/login" className="result-nav-login">
                            Login
                        </Link>
                    )}
                </div>
            </header>

            <div className="result-grid">
                <section className="result-col result-col--main">
                    <p className="result-kicker">PROJECT CANVAS</p>
                    <h1 className="result-title">{data.project_title}</h1>

                    <div className="result-hero-wrap">
                        {payload.previewDataUrl ? (
                            <img
                                src={payload.previewDataUrl}
                                alt=""
                                className="result-hero-img"
                            />
                        ) : (
                            <div className="result-hero-placeholder" role="img" aria-label="No preview" />
                        )}
                        <span className="result-hero-badge">Focus point alpha</span>
                    </div>

                    <div className="result-meta-row">
                        <div className="result-meta-cell">
                            <span className="result-meta-label">Resolution</span>
                            <span className="result-meta-value">
                                {w && h ? `${w} × ${h}` : '—'}
                            </span>
                        </div>
                    </div>

                    <article className="result-article">
                        <h2 className="result-article-title">Analysis result</h2>
                        <p className="result-intro">{data.intro_summary}</p>
                        <hr className="result-divider" />
                        <p className="result-rating-line">
                            <strong>Rating:</strong>{' '}
                            {data.rating != null && data.rating.score != null
                                ? data.rating.score
                                : '—'}
                            /10
                        </p>
                        <p className="result-rating-explain">
                            <strong>Explanation for rating:</strong>{' '}
                            {data.rating?.explanation?.trim() ? data.rating.explanation : '—'}
                        </p>

                        <hr className="result-divider" />
                        <h3 className="result-section-title">Strengths</h3>
                        {data.strengths?.length > 0 ? (
                            <ul className="result-bullet-list">
                                {data.strengths.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="result-section-empty">No strengths listed in this response.</p>
                        )}

                        <hr className="result-divider" />
                        <h3 className="result-section-title">Weaknesses</h3>
                        {data.weaknesses?.length > 0 ? (
                            <ul className="result-bullet-list result-bullet-list--weak">
                                {data.weaknesses.map((w, i) => (
                                    <li key={i}>
                                        <span className="result-weak-text">{w.point}</span>
                                        {w.severity != null && (
                                            <span className="result-weak-severity"> ({w.severity}/10)</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="result-section-empty">No weaknesses listed in this response.</p>
                        )}

                        <hr className="result-divider" />
                        <h3 className="result-section-title">How to improve</h3>
                        {data.improvement_suggestions?.length > 0 ? (
                            <ol className="result-numbered-list">
                                {data.improvement_suggestions.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ol>
                        ) : (
                            <p className="result-section-empty">No suggestions listed in this response.</p>
                        )}
                    </article>
                </section>

                <aside className="result-col result-col--side">
                    <h2 className="result-side-title">Architectural integrity</h2>
                    <p className="result-side-lead">{data.architectural_integrity?.summary}</p>

                    <div className="result-metrics">
                        {[
                            ['Usability', data.scores.usability],
                            ['Visual balance', data.scores.visual_balance],
                            ['Accessibility', data.scores.accessibility],
                        ].map(([label, pct]) => (
                            <div className="result-metric" key={label}>
                                <div className="result-metric-head">
                                    <span className="result-metric-label">{label}</span>
                                    <span className="result-metric-pct">{pct}%</span>
                                </div>
                                <div className="result-metric-track">
                                    <div
                                        className="result-metric-fill"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="result-ai-card">
                        <h3 className="result-ai-heading">
                            <span aria-hidden>🧬</span> AI analysis
                        </h3>
                        <p className="result-ai-summary">{data.ai_analysis?.summary}</p>

                        <div className="result-donut-wrap">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={58}
                                        outerRadius={82}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((_, i) => (
                                            <Cell
                                                key={i}
                                                fill={i === 0 ? '#0a0a0a' : '#d8d8d8'}
                                            />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="result-donut-center" aria-hidden>
                                <span className="result-donut-big">{data.ai_analysis.ai_likeness_percent}%</span>
                                <span className="result-donut-sub">AI signals</span>
                            </div>
                        </div>
                        <p className="result-donut-legend">
                            <span className="result-leg-ai">■ AI-like</span>
                            <span className="result-leg-hu">■ Human craft</span>
                            <span>{data.ai_analysis.human_likeness_percent}% human</span>
                        </p>
                    </div>

                    <div className="result-rules">
                        <h3 className="result-rules-title">Signal breakdown</h3>
                        {(data.ai_analysis.categories || []).length === 0 && (
                            <p className="result-rules-empty">No category bullets in this response.</p>
                        )}
                        {(data.ai_analysis.categories || []).map((cat) => (
                            <div className="result-rule-block" key={cat.title}>
                                <h4 className="result-rule-h">
                                    <span className="result-rule-emoji">{cat.emoji}</span>
                                    {cat.title}
                                </h4>
                                <ul className="result-rule-list">
                                    {(cat.bullets || []).map((b, i) => (
                                        <li key={i}>{b}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="result-observations">
                        <h3 className="result-obs-title">Key observations</h3>
                        {data.key_observations.length > 0 ? (
                            <ul className="result-obs-list">
                                {data.key_observations.map((obs, i) => (
                                    <li
                                        key={i}
                                        className={`result-obs-item result-obs-item--${obs.tone || 'positive'}`}
                                    >
                                        <ObservationIcon tone={obs.tone} />
                                        <span>{obs.text}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="result-obs-empty">No key observations in this response.</p>
                        )}
                    </div>

                    <button type="button" className="result-download" onClick={downloadReport}>
                        Download report
                    </button>
                    <Link to="/" className="result-new">
                        New analysis
                    </Link>
                </aside>
            </div>
        </div>
    );
}
