import { jsPDF } from 'jspdf';

function stripForPdf(s) {
    if (s == null) return '';
    return String(s)
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function addWrappedText(doc, text, margin, startY, maxWidth, fontSize, lineHeightFactor) {
    const lines = doc.splitTextToSize(text, maxWidth);
    let y = startY;
    const lh = fontSize * lineHeightFactor;
    const pageH = doc.internal.pageSize.getHeight();
    lines.forEach((ln) => {
        if (y > pageH - margin) {
            doc.addPage();
            y = margin;
        }
        doc.text(ln, margin, y);
        y += lh;
    });
    return y;
}

/**
 * Builds a downloadable PDF from normalized analysis data.
 * @param {object} data - normalized structured report
 * @param {string | null} previewDataUrl - optional data URL for screenshot
 */
export function downloadAnalysisPdf(data, previewDataUrl) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 14;
    const maxW = pageW - 2 * margin;
    let y = margin;

    const title = stripForPdf(data.project_title) || 'Blinky Analysis';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(title, margin, y);
    y += 10;

    if (previewDataUrl && /^data:image\//i.test(previewDataUrl)) {
        const fmt = previewDataUrl.includes('image/jpeg') || previewDataUrl.includes('image/jpg')
            ? 'JPEG'
            : 'PNG';
        try {
            const imgW = maxW;
            const imgH = 70;
            if (y + imgH > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                y = margin;
            }
            doc.addImage(previewDataUrl, fmt, margin, y, imgW, imgH);
            y += imgH + 6;
        } catch {
            y += 4;
        }
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const blocks = [];

    blocks.push(['Summary', stripForPdf(data.intro_summary)]);
    if (data.rating?.score != null) {
        blocks.push([
            'Rating',
            `${data.rating.score}/10. ${stripForPdf(data.rating.explanation)}`,
        ]);
    }
    if (data.architectural_integrity?.summary) {
        blocks.push(['Architectural integrity', stripForPdf(data.architectural_integrity.summary)]);
    }
    if (data.scores) {
        const s = data.scores;
        blocks.push([
            'Scores',
            `Usability ${s.usability ?? '—'}%, Visual balance ${s.visual_balance ?? '—'}%, Accessibility ${s.accessibility ?? '—'}%`,
        ]);
    }

    if (Array.isArray(data.strengths) && data.strengths.length) {
        blocks.push([
            'Strengths',
            data.strengths.map((t, i) => `${i + 1}. ${stripForPdf(t)}`).join('\n'),
        ]);
    }
    if (Array.isArray(data.weaknesses) && data.weaknesses.length) {
        blocks.push([
            'Weaknesses',
            data.weaknesses
                .map((w, i) => {
                    const sev =
                        w.severity != null ? ` (severity ${w.severity}/10)` : '';
                    return `${i + 1}. ${stripForPdf(w.point)}${sev}`;
                })
                .join('\n'),
        ]);
    }
    if (Array.isArray(data.improvement_suggestions) && data.improvement_suggestions.length) {
        blocks.push([
            'How to improve',
            data.improvement_suggestions.map((t, i) => `${i + 1}. ${stripForPdf(t)}`).join('\n'),
        ]);
    }

    const ai = data.ai_analysis;
    if (ai) {
        blocks.push([
            'AI analysis',
            `${stripForPdf(ai.summary)}\nAI-like: ${ai.ai_likeness_percent ?? '—'}%, Human craft: ${ai.human_likeness_percent ?? '—'}%`,
        ]);
        if (Array.isArray(ai.categories) && ai.categories.length) {
            const catText = ai.categories
                .map((c) => {
                    const head = stripForPdf(c.title);
                    const bullets = (c.bullets || [])
                        .map((b) => `  • ${stripForPdf(b)}`)
                        .join('\n');
                    return `${head}\n${bullets}`;
                })
                .join('\n\n');
            blocks.push(['Signal breakdown', catText]);
        }
    }

    if (Array.isArray(data.key_observations) && data.key_observations.length) {
        blocks.push([
            'Key observations',
            data.key_observations.map((o) => `• ${stripForPdf(o.text)}`).join('\n'),
        ]);
    }

    blocks.forEach(([heading, body]) => {
        if (!body) return;
        if (y > doc.internal.pageSize.getHeight() - 40) {
            doc.addPage();
            y = margin;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(heading, margin, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        y = addWrappedText(doc, body, margin, y, maxW, 10, 0.45);
        y += 6;
    });

    const fname = `${(data.project_title || 'blinky-report').replace(/\s+/g, '_').replace(/[^\w.-]/g, '')}.pdf`;
    doc.save(fname);
}
