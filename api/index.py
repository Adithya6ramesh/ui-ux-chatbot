import json
import os
import re
import time
import traceback
from io import BytesIO

import google.generativeai as genai
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from PIL import Image

# Build the absolute path to the .env file and load it
script_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(script_dir, '.env')
load_dotenv(dotenv_path=dotenv_path)

# Configure the Gemini API key from environment variable
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY environment variable not set.")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')

prompt_path = os.path.join(script_dir, 'prompt.txt')
with open(prompt_path, 'r', encoding='utf-8') as f:
    prompt_text = f.read()

frontend_dist_path = os.path.join(os.path.dirname(script_dir), 'frontend', 'dist')

app = Flask(__name__, static_folder=frontend_dist_path, static_url_path='')
CORS(app)


def _extract_json_text(raw: str) -> str:
    raw = raw.strip()
    if raw.startswith('```'):
        raw = re.sub(r'^```(?:json)?\s*', '', raw, flags=re.IGNORECASE)
        raw = re.sub(r'\s*```$', '', raw)
    return raw.strip()


def _parse_structured_response(raw_text: str) -> dict:
    text = _extract_json_text(raw_text)
    return json.loads(text)


def _to_float(v):
    if v is None or v == '':
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def normalize_structured_response(obj):
    """Map alternate Gemini keys and scales into the shape the UI expects."""
    if not isinstance(obj, dict):
        return {}
    data = dict(obj)

    scores_in = data.get('scores')
    if not isinstance(scores_in, dict):
        scores_in = {}
    scores = {}

    metric_aliases = {
        'usability': (
            'usability',
            'Usability',
            'usability_percent',
            'usability_score',
        ),
        'visual_balance': (
            'visual_balance',
            'VisualBalance',
            'visual_balance_percent',
            'visual_balance_score',
        ),
        'accessibility': (
            'accessibility',
            'Accessibility',
            'accessibility_percent',
            'accessibility_score',
        ),
    }

    for canonical, candidates in metric_aliases.items():
        val = None
        for c in candidates:
            if c in scores_in and scores_in[c] is not None:
                val = _to_float(scores_in[c])
                break
        if val is None:
            for c in candidates:
                if c in data and data[c] is not None:
                    val = _to_float(data[c])
                    break
        if val is not None:
            if val <= 10:
                val = val * 10.0
            scores[canonical] = int(max(0, min(100, round(val))))

    for canonical in metric_aliases:
        scores.setdefault(canonical, 0)
    data['scores'] = scores

    rating = data.get('rating')
    if not isinstance(rating, dict):
        rating = {}
    if rating.get('score') is None:
        for k in ('overall_score', 'final_score', 'OverallScore', 'FinalScore'):
            if k in data:
                s = _to_float(data[k])
                if s is not None:
                    if s > 10:
                        rating['score'] = int(max(1, min(10, round(s / 10))))
                    else:
                        rating['score'] = int(max(1, min(10, round(s))))
                    break
    if rating.get('explanation') in (None, ''):
        for k in ('rating_explanation', 'rating_reason', 'final_score_explanation'):
            if isinstance(data.get(k), str) and data[k].strip():
                rating['explanation'] = data[k].strip()
                break
    if rating.get('score') is None and scores:
        u, v, a = scores['usability'], scores['visual_balance'], scores['accessibility']
        if u or v or a:
            avg_pct = (u + v + a) / 3.0
            rating['score'] = max(1, min(10, int(round(avg_pct / 10))))
    data['rating'] = rating

    if not (isinstance(data.get('intro_summary'), str) and data['intro_summary'].strip()):
        for k in ('summary', 'executive_summary', 'overview', 'analysis_intro'):
            if isinstance(data.get(k), str) and data[k].strip():
                data['intro_summary'] = data[k].strip()
                break
    if not (isinstance(data.get('intro_summary'), str) and data['intro_summary'].strip()):
        data['intro_summary'] = (
            'Structured analysis below: usability, visual balance, accessibility, '
            'and AI-vs-human signals derived from the uploaded interface.'
        )

    arch = data.get('architectural_integrity')
    if not isinstance(arch, dict):
        arch = {}
    if not (isinstance(arch.get('summary'), str) and arch['summary'].strip()):
        for k in ('architectural_summary', 'spatial_analysis', 'integrity_summary'):
            if isinstance(data.get(k), str) and data[k].strip():
                arch['summary'] = data[k].strip()
                break
    if not (isinstance(arch.get('summary'), str) and arch['summary'].strip()):
        arch['summary'] = (
            'Spatial hierarchy, rhythm, and density were evaluated from the screenshot. '
            'See metric bars and the signal breakdown for specifics.'
        )
    data['architectural_integrity'] = arch

    aan = data.get('ai_analysis')
    if not isinstance(aan, dict):
        aan = {}
    if aan.get('ai_likeness_percent') is None:
        for k in ('ai_usage_probability', 'AI_likeness_percent', 'ai_percent'):
            v = _to_float(aan.get(k) if k in aan else data.get(k))
            if v is not None:
                if v <= 1.0:
                    v = v * 100.0
                aan['ai_likeness_percent'] = int(max(0, min(100, round(v))))
                break
    if aan.get('human_likeness_percent') is None and aan.get('ai_likeness_percent') is not None:
        aan['human_likeness_percent'] = max(0, min(100, 100 - int(aan['ai_likeness_percent'])))
    if not (isinstance(aan.get('summary'), str) and aan['summary'].strip()):
        for k in ('ai_generation_analysis', 'ai_verdict', 'AI_analysis_summary'):
            if isinstance(data.get(k), str) and data[k].strip():
                aan['summary'] = data[k].strip()
                break
    if not (isinstance(aan.get('summary'), str) and aan['summary'].strip()):
        aan['summary'] = (
            'Heuristic pass over AI-generation tells (palette, typography, layout symmetry, '
            'copy tone, and component repetition). See categories and percentages.'
        )
    if not isinstance(aan.get('categories'), list):
        aan['categories'] = []
    data['ai_analysis'] = aan

    if not isinstance(data.get('key_observations'), list):
        data['key_observations'] = []

    def _coerce_text_line(row, rating_keys=('rating', 'score', 'priority'), text_keys=None):
        """Turn model objects into a single display line: Label (N/10): rest."""
        if text_keys is None:
            text_keys = ('explanation', 'detail', 'text', 'point', 'description', 'body')
        if isinstance(row, str) and row.strip():
            return row.strip()
        if not isinstance(row, dict):
            return None
        label = row.get('heading') or row.get('title') or row.get('aspect') or row.get('label')
        r = None
        for k in rating_keys:
            if row.get(k) is not None:
                r = _to_float(row[k])
                break
        if r is not None and r <= 1.0:
            r = r * 10.0
        rest = None
        for k in text_keys:
            v = row.get(k)
            if isinstance(v, str) and v.strip():
                rest = v.strip()
                break
        one = row.get('text') or row.get('point')
        if isinstance(one, str) and one.strip() and not label:
            return one.strip()
        if label and rest:
            if r is not None:
                rn = int(max(1, min(10, round(r))))
                return f'{label} ({rn}/10): {rest}'
            return f'{label}: {rest}'
        return None

    def _ensure_str_list(val):
        if not isinstance(val, list):
            return []
        out = []
        for row in val:
            if isinstance(row, str) and row.strip():
                out.append(row.strip())
            elif isinstance(row, dict):
                t = row.get('text') or row.get('point') or row.get('title')
                if isinstance(t, str) and t.strip():
                    out.append(t.strip())
                else:
                    line = _coerce_text_line(row)
                    if line:
                        out.append(line)
        return out

    def _ensure_weaknesses(val):
        if not isinstance(val, list):
            return []
        out = []
        for row in val:
            if isinstance(row, dict):
                t = row.get('point') or row.get('text') or row.get('issue')
                if not (isinstance(t, str) and t.strip()):
                    line = _coerce_text_line(
                        row,
                        rating_keys=('severity', 'rating', 'score'),
                        text_keys=('explanation', 'detail', 'text', 'description', 'body'),
                    )
                    t = line
                sev = row.get('severity')
                if isinstance(t, str) and t.strip():
                    try:
                        sev_int = int(sev) if sev is not None else None
                    except (TypeError, ValueError):
                        sev_int = None
                    if sev_int is not None:
                        sev_int = max(1, min(10, sev_int))
                    out.append({'point': t.strip(), 'severity': sev_int})
            elif isinstance(row, str) and row.strip():
                out.append({'point': row.strip(), 'severity': None})
        return out

    strengths = _ensure_str_list(data.get('strengths'))
    if not strengths:
        strengths = _ensure_str_list(data.get('key_strengths'))
    data['strengths'] = strengths

    weaknesses = _ensure_weaknesses(data.get('weaknesses'))
    if not weaknesses:
        weaknesses = _ensure_weaknesses(data.get('weaknesses_detailed'))
    data['weaknesses'] = weaknesses

    sugg = _ensure_str_list(data.get('improvement_suggestions'))
    if not sugg:
        sugg = _ensure_str_list(data.get('suggestions') or data.get('actionable_improvements'))
    data['improvement_suggestions'] = sugg

    return data


@app.after_request
def add_cors_headers(response):
    response.headers['Cross-Origin-Opener-Policy'] = 'same-origin-allow-popups'
    return response


@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if not GEMINI_API_KEY:
        return jsonify({'error': 'Gemini API key is not configured on the server.'}), 500

    raw_bytes = file.read()
    try:
        img = Image.open(BytesIO(raw_bytes))
        width, height = img.size
        # Ensure RGB for models that reject palette modes
        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGB')
    except Exception as e:
        return jsonify({'error': f'Invalid image file: {e}'}), 400

    generation_config = genai.GenerationConfig(
        response_mime_type='application/json',
        temperature=0.35,
    )

    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        t0 = time.perf_counter()
        response = model.generate_content(
            [prompt_text, img],
            generation_config=generation_config,
        )
        elapsed = time.perf_counter() - t0

        raw_text = getattr(response, 'text', None)
        if not raw_text and response.candidates:
            parts = response.candidates[0].content.parts
            raw_text = ''.join(getattr(p, 'text', '') for p in parts)

        if not raw_text:
            return jsonify({'error': 'Empty response from model.'}), 500

        structured = _parse_structured_response(raw_text)
        structured = normalize_structured_response(structured)

        structured['meta'] = {
            'width': width,
            'height': height,
            'processed_seconds': round(elapsed, 2),
            'model_label': 'Blinky-Vision v4.0',
            'filename': file.filename or 'upload',
        }

        return jsonify({'structured': structured})
    except json.JSONDecodeError as e:
        traceback.print_exc()
        return jsonify({'error': f'Invalid JSON from model: {e}'}), 500
    except Exception as e:
        print('An error occurred during analysis:')
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/analyze', methods=['POST'])
def analyze_image_legacy():
    return analyze_image()


@app.route('/')
def serve_react_app():
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/<path:path>')
def serve_react_routes(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
