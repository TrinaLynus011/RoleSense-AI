"""AI Candidate Ranking System — Streamlit Dashboard."""

import os
import sys
import json
import io
import csv
import hashlib
import time
import logging
from typing import Optional

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from src.data_loader import (
    load_workindia_candidates,
    load_role_radar_profiles,
    load_job_descriptions,
    load_job_description_text,
    normalize_candidate,
)
from src.ranker import CandidateRanker, format_output

logging.basicConfig(level=logging.WARNING)

st.set_page_config(
    page_title="AI Candidate Ranking",
    page_icon="🎯",
    layout="wide",
    initial_sidebar_state="expanded",
)

CUSTOM_CSS = """
<style>
    /* === GLOBAL DARK THEME === */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    html, body, [class*="css"] {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .stApp {
        background: #0b0f1a;
        color: #e8edf5;
    }
    .stApp > header {
        background: transparent;
    }
    /* === SIDEBAR === */
    section[data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0f1320 0%, #1a1f30 100%);
        border-right: 1px solid rgba(255,255,255,0.05);
    }
    section[data-testid="stSidebar"] .stMarkdown {
        color: #9aa4bf;
    }
    /* === METRIC CARDS === */
    div[data-testid="metric-container"] {
        background: linear-gradient(135deg, rgba(30,40,80,0.6), rgba(20,25,50,0.8));
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 18px 20px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    div[data-testid="metric-container"]:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
    }
    div[data-testid="metric-container"] label {
        color: #7a84a8 !important;
        font-weight: 500 !important;
        font-size: 0.75rem !important;
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }
    div[data-testid="metric-container"] div[data-testid="stMetricValue"] {
        color: #e8edf5 !important;
        font-weight: 700 !important;
        font-size: 1.8rem !important;
    }
    /* === GLASSMORPHISM CARDS === */
    .glass-card {
        background: linear-gradient(135deg, rgba(30,40,80,0.5), rgba(20,25,50,0.7));
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 18px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04);
        transition: all 0.25s ease;
    }
    .glass-card:hover {
        border-color: rgba(255,255,255,0.12);
        box-shadow: 0 12px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06);
    }
    .glass-card h3 {
        color: #e8edf5;
        font-weight: 600;
        margin-top: 0;
    }
    .glass-card p {
        color: #9aa4bf;
        line-height: 1.6;
    }
    /* === CANDIDATE CARDS === */
    .candidate-card {
        background: linear-gradient(135deg, rgba(25,35,70,0.6), rgba(15,20,40,0.8));
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 14px;
        transition: all 0.25s ease;
        cursor: default;
    }
    .candidate-card:hover {
        border-color: rgba(100,140,255,0.25);
        transform: translateX(4px);
        box-shadow: 0 4px 20px rgba(60,100,255,0.1);
    }
    .candidate-rank-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
        border-radius: 10px;
        font-weight: 700;
        font-size: 0.85rem;
        padding: 0 10px;
        margin-right: 12px;
    }
    .rank-gold { background: linear-gradient(135deg, #f7931a, #f5c542); color: #1a1200; }
    .rank-silver { background: linear-gradient(135deg, #a8b8d0, #c8d4e4); color: #141a24; }
    .rank-bronze { background: linear-gradient(135deg, #cd7f32, #e8a84c); color: #1a0e00; }
    .rank-default { background: rgba(255,255,255,0.06); color: #7a84a8; }
    /* === PROGRESS BARS === */
    .score-bar-container {
        width: 100%;
        height: 6px;
        background: rgba(255,255,255,0.06);
        border-radius: 4px;
        overflow: hidden;
        margin: 6px 0;
    }
    .score-bar-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.6s ease;
    }
    /* === BUTTONS === */
    .stButton > button {
        background: linear-gradient(135deg, #3b5eff, #2950d8) !important;
        color: white !important;
        border: none !important;
        border-radius: 10px !important;
        font-weight: 600 !important;
        padding: 8px 20px !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 2px 12px rgba(59,94,255,0.25) !important;
    }
    .stButton > button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 20px rgba(59,94,255,0.4) !important;
    }
    /* === TABS === */
    .stTabs [data-baseweb="tab-list"] {
        background: rgba(255,255,255,0.03);
        border-radius: 12px;
        padding: 4px;
        gap: 4px;
    }
    .stTabs [data-baseweb="tab"] {
        border-radius: 10px !important;
        padding: 8px 20px !important;
        color: #7a84a8 !important;
        font-weight: 500 !important;
        transition: all 0.2s;
    }
    .stTabs [aria-selected="true"] {
        background: linear-gradient(135deg, rgba(59,94,255,0.25), rgba(59,94,255,0.1)) !important;
        color: #e8edf5 !important;
    }
    /* === SEARCH === */
    .stTextInput > div > div {
        background: rgba(255,255,255,0.04) !important;
        border: 1px solid rgba(255,255,255,0.08) !important;
        border-radius: 12px !important;
        color: #e8edf5 !important;
    }
    .stSelectbox > div > div {
        background: rgba(255,255,255,0.04) !important;
        border: 1px solid rgba(255,255,255,0.08) !important;
        border-radius: 12px !important;
    }
    /* === EXPANDER === */
    .streamlit-expanderHeader {
        background: rgba(255,255,255,0.02) !important;
        border-radius: 10px !important;
        font-weight: 500 !important;
    }
    /* === SCROLLBAR === */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #0b0f1a; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
    /* === HEADER === */
    .app-header {
        text-align: center;
        padding: 20px 0 10px 0;
    }
    .app-header h1 {
        font-size: 2.4rem;
        font-weight: 800;
        background: linear-gradient(135deg, #e8edf5 0%, #7a94ff 50%, #5b7fff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 4px;
    }
    .app-header p {
        color: #7a84a8;
        font-size: 1rem;
    }
    .stAlert {
        border-radius: 12px !important;
    }
    hr {
        border-color: rgba(255,255,255,0.06) !important;
    }
</style>
"""


@st.cache_resource
def get_ranker():
    return CandidateRanker()


@st.cache_data
def load_data(source: str):
    if source == "WorkIndia (Blue/Grey Collar)":
        return load_workindia_candidates()
    return load_role_radar_profiles()


@st.cache_data
def rank_candidates(_ranker, _candidates, jd_text: str):
    _ranker.load_job_description(jd_text)
    return _ranker.rank(_candidates)


def score_to_color(score: float) -> str:
    if score >= 0.7:
        return "#4ade80"
    if score >= 0.5:
        return "#fbbf24"
    if score >= 0.3:
        return "#fb923c"
    return "#f87171"


def confidence_color(conf: str) -> str:
    return {"High": "#4ade80", "Medium": "#fbbf24", "Low": "#fb923c", "Very Low": "#f87171"}.get(conf, "#7a84a8")


def render_candidate_card(candidate: dict, idx: int):
    rank = candidate["rank"]
    if rank == 1:
        badge_cls = "rank-gold"
    elif rank == 2:
        badge_cls = "rank-silver"
    elif rank == 3:
        badge_cls = "rank-bronze"
    else:
        badge_cls = "rank-default"

    score = candidate["overall_score"]
    col = score_to_color(score)

    skills = candidate.get("skills", [])
    explanation = candidate.get("explanation", {})
    confidence = explanation.get("confidence", "Medium")
    conf_col = confidence_color(confidence)

    name = candidate.get("name", f"Candidate #{idx+1}")
    name_str = str(name) if not isinstance(name, str) else name

    loc = candidate.get("location") or candidate.get("city") or ""
    prev_job = candidate.get("previous_job_title", "") or ""
    exp_years = candidate.get("years_experience")
    exp_str = f"{exp_years}y exp" if exp_years else candidate.get("qualification", "")

    st.markdown(f"""
    <div class="candidate-card">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
            <div style="display:flex; align-items:center;">
                <span class="candidate-rank-badge {badge_cls}">#{rank}</span>
                <div>
                    <strong style="font-size:1.1rem; color:#e8edf5;">{name_str}</strong>
                    <div style="font-size:0.8rem; color:#7a84a8; margin-top:2px;">
                        {loc}{" · " + prev_job if prev_job else ""}{" · " + exp_str if exp_str else ""}
                    </div>
                </div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:1.5rem; font-weight:700; color:{col};">{score:.3f}</div>
                <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.06em; color:#7a84a8;">Score</div>
            </div>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px;">
            {''.join(f'<span style="background:rgba(59,94,255,0.15); color:#8aa4ff; border-radius:6px; padding:2px 10px; font-size:0.75rem;">{s}</span>' for s in skills[:6])}
        </div>
        <div style="display:flex; gap:16px; flex-wrap:wrap; font-size:0.8rem;">
            <span>👍 <strong style="color:{col};">Score Breakdown</strong></span>
            <span>🎯 <strong style="color:{conf_col};">{confidence} Confidence</strong></span>
            { '<span>🔴 <strong style="color:#fb923c;">Looking Urgently</strong></span>' if candidate.get('is_looking_urgently') else ''}
            { '<span>📄 <strong style="color:#7a84a8;">Has Resume</strong></span>' if candidate.get('has_resume') else ''}
        </div>
    </div>
    """, unsafe_allow_html=True)

    with st.expander("View Full Analysis", expanded=False):
        col1, col2 = st.columns(2)
        with col1:
            st.markdown("**Score Breakdown**")
            breakdown = candidate.get("score_breakdown", {})
            for key, val in breakdown.items():
                label = key.replace("_", " ").title()
                bar_col = score_to_color(val)
                st.markdown(f"""
                <div style="margin:6px 0;">
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem;">
                        <span style="color:#9aa4bf;">{label}</span>
                        <span style="color:{bar_col}; font-weight:600;">{val:.2%}</span>
                    </div>
                    <div class="score-bar-container">
                        <div class="score-bar-fill" style="width:{val*100:.0f}%; background:{bar_col};"></div>
                    </div>
                </div>
                """, unsafe_allow_html=True)

        with col2:
            st.markdown("**Strengths**")
            for s in explanation.get("strengths", []):
                st.markdown(f"✅ {s}")
            st.markdown("**Areas to Note**")
            for w in explanation.get("weaknesses", []):
                st.markdown(f"⚠️ {w}")
            st.markdown("**Recruiter Note**")
            st.info(explanation.get("recommendation", "No recommendation available"))


def render_analytics(ranked, candidates):
    st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
    st.subheader("📊 Score Distribution")
    scores = [r["overall_score"] for r in ranked]
    fig = px.histogram(
        x=scores, nbins=20, color_discrete_sequence=["#3b5eff"],
        labels={"x": "Score", "y": "Count"},
    )
    fig.update_layout(
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
        font_color="#9aa4bf",
        xaxis=dict(gridcolor="rgba(255,255,255,0.04)"),
        yaxis=dict(gridcolor="rgba(255,255,255,0.04)"),
        margin=dict(l=20, r=20, t=30, b=30),
    )
    fig.add_vline(x=0.7, line_dash="dash", line_color="#4ade80", annotation_text="Strong (0.7)")
    fig.add_vline(x=0.5, line_dash="dash", line_color="#fbbf24", annotation_text="Good (0.5)")
    fig.add_vline(x=0.3, line_dash="dash", line_color="#fb923c", annotation_text="Weak (0.3)")
    st.plotly_chart(fig, width="stretch")
    st.markdown("</div>", unsafe_allow_html=True)

    st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
    st.subheader("📈 Ranking Trend")
    ranks = list(range(1, len(ranked) + 1))
    scores_sorted = sorted(scores, reverse=True)
    fig2 = go.Figure()
    fig2.add_trace(go.Scatter(
        x=ranks, y=scores_sorted, mode="lines+markers",
        line=dict(color="#3b5eff", width=2),
        marker=dict(color="#3b5eff", size=4),
        fill="tozeroy", fillcolor="rgba(59,94,255,0.08)",
    ))
    fig2.update_layout(
        plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
        font_color="#9aa4bf", xaxis_title="Rank", yaxis_title="Score",
        xaxis=dict(gridcolor="rgba(255,255,255,0.04)"),
        yaxis=dict(gridcolor="rgba(255,255,255,0.04)", range=[0, 1]),
        margin=dict(l=20, r=20, t=10, b=30),
    )
    st.plotly_chart(fig2, width="stretch")
    st.markdown("</div>", unsafe_allow_html=True)

    col1, col2 = st.columns(2)
    with col1:
        st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
        st.subheader("🔝 Top Skill Frequencies")
        all_skills = []
        for r in ranked:
            all_skills.extend(r.get("skills", []))
        if all_skills:
            skill_counts = pd.Series(all_skills).value_counts().head(10)
            fig3 = px.bar(
                x=skill_counts.values, y=skill_counts.index, orientation="h",
                color_discrete_sequence=["#3b5eff"],
                labels={"x": "Count", "y": ""},
            )
            fig3.update_layout(
                plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
                font_color="#9aa4bf", yaxis=dict(autorange="reversed"),
                margin=dict(l=10, r=10, t=10, b=10),
            )
            st.plotly_chart(fig3, width="stretch")
        st.markdown("</div>", unsafe_allow_html=True)

    with col2:
        st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
        st.subheader("📋 Experience Distribution")
        exp_values = []
        for c in candidates:
            nc = normalize_candidate(c)
            yrs = nc.get("years_experience")
            if yrs is not None:
                exp_values.append(yrs)
        if exp_values:
            fig4 = px.histogram(
                x=exp_values, nbins=15, color_discrete_sequence=["#fbbf24"],
                labels={"x": "Years of Experience", "y": "Count"},
            )
            fig4.update_layout(
                plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
                font_color="#9aa4bf",
                xaxis=dict(gridcolor="rgba(255,255,255,0.04)"),
                yaxis=dict(gridcolor="rgba(255,255,255,0.04)"),
                margin=dict(l=10, r=10, t=10, b=10),
            )
            st.plotly_chart(fig4, width="stretch")
        st.markdown("</div>", unsafe_allow_html=True)


def main():
    st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

    st.markdown("""
    <div class="app-header">
        <h1>🎯 AI Candidate Ranking</h1>
        <p>Rank candidates the way a great recruiter would — by understanding who genuinely fits the role</p>
    </div>
    """, unsafe_allow_html=True)

    st.sidebar.markdown("### ⚙️ Configuration")
    source_map = {
        "WorkIndia (Blue/Grey Collar)": "workindia",
        "Role Radar (Professional Profiles)": "role_radar",
    }
    source_label = st.sidebar.selectbox(
        "Candidate Source", list(source_map.keys()), index=0
    )
    source = source_map[source_label]

    with st.sidebar.expander("ℹ️ About", expanded=False):
        st.markdown("""
        **AI Candidate Ranking System**  
        Built for INDIA RUNS — Redrob AI × Hack2skill  

        Uses semantic embeddings + 8-dimension hybrid scoring to rank candidates beyond keywords.  
        """)

    top_n = st.sidebar.slider("Show Top N Candidates", 5, 100, 20, step=5)

    jd_source = st.sidebar.radio("Job Description Source", ["Default (Delivery Executive)", "Custom Text", "From Dataset"], index=0)

    jd_text = ""
    if jd_source == "Default (Delivery Executive)":
        jd_text = load_job_description_text()
    elif jd_source == "Custom Text":
        jd_text = st.sidebar.text_area("Paste Job Description", height=200)
    else:
        jobs = load_job_descriptions()
        job_titles = [f"{j.get('title', 'Untitled')} @ {j.get('company', 'Unknown')}" for j in jobs[:100]]
        selected = st.sidebar.selectbox("Select Job", job_titles, index=0)
        idx = job_titles.index(selected)
        job = jobs[idx]
        jd_text = f"{job.get('title', '')}\n\n{job.get('description', '')}"

    if not jd_text or not jd_text.strip():
        jd_text = "Delivery Executive - Mumbai\n\nWe need a Delivery Executive in Mumbai. Must have bike and 1+ year experience."

    with st.spinner("Loading candidates and ranking..."):
        candidates = load_data(source)
        ranker = get_ranker()
        ranked = rank_candidates(ranker, candidates, jd_text)

    jd_info = ranker.jd_info

    col1, col2, col3, col4, col5 = st.columns(5)
    with col1:
        st.metric("Candidates", len(ranked))
    with col2:
        st.metric("Top Score", f"{ranked[0]['overall_score']:.3f}" if ranked else "N/A")
    with col3:
        avg_score = sum(r["overall_score"] for r in ranked) / len(ranked) if ranked else 0
        st.metric("Avg Score", f"{avg_score:.3f}")
    with col4:
        above_70 = sum(1 for r in ranked if r["overall_score"] >= 0.7)
        st.metric("Strong Matches (≥0.7)", above_70)
    with col5:
        st.metric("Job Location", jd_info.get("location", "Any") or "Any")

    st.markdown(f"""
    <div class="glass-card">
        <h3>📋 Job Description</h3>
        <p style="font-size:0.9rem;">{jd_info.get('title', 'N/A')}</p>
        <div style="display:flex; gap:12px; flex-wrap:wrap; font-size:0.8rem; color:#7a84a8;">
            <span>📍 {jd_info.get('location', 'Any location')}</span>
            <span>💼 Min Experience: {jd_info.get('min_years', 'Not specified')} years</span>
            <span>🔧 Skills: {', '.join(jd_info.get('skills', [])[:5]) or 'Auto-detected'}</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    tab1, tab2, tab3 = st.tabs(["📋 Ranked Candidates", "📊 Analytics", "💾 Export"])

    with tab1:
        search = st.text_input("🔍 Search candidates by name or skill", placeholder="e.g. delivery, bike, mumbai")
        filter_col1, filter_col2, filter_col3 = st.columns(3)
        with filter_col1:
            min_score = st.slider("Min Score", 0.0, 1.0, 0.0, 0.05)
        with filter_col2:
            sort_by = st.selectbox("Sort By", ["Rank", "Score (High→Low)", "Name A→Z"], index=0)
        with filter_col3:
            confidence_filter = st.selectbox("Confidence", ["All", "High", "Medium", "Low"], index=0)

        filtered = list(ranked)
        if search:
            q = search.lower()
            filtered = [r for r in filtered if
                        q in str(r.get("name", "")).lower() or
                        any(q in s.lower() for s in r.get("skills", [])) or
                        q in str(r.get("location", "")).lower()]
        filtered = [r for r in filtered if r["overall_score"] >= min_score]
        if confidence_filter != "All":
            filtered = [r for r in filtered if r.get("explanation", {}).get("confidence") == confidence_filter]
        if sort_by == "Score (High→Low)":
            filtered.sort(key=lambda x: x["overall_score"], reverse=True)
        elif sort_by == "Name A→Z":
            filtered.sort(key=lambda x: str(x.get("name", "")))

        for i, r in enumerate(filtered[:top_n]):
            render_candidate_card(r, i)

        if len(filtered) > top_n:
            st.markdown(f"<p style='color:#7a84a8;text-align:center;'>Showing {top_n} of {len(filtered)} matching candidates</p>", unsafe_allow_html=True)

    with tab2:
        render_analytics(ranked, candidates)

    with tab3:
        st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
        st.subheader("💾 Download Ranked Candidates")
        st.markdown("Export the ranked candidate list for use in your ATS or spreadsheet.")

        output = format_output(ranked, top_n=None)
        df_data = []
        for r in output:
            breakdown = r.get("score_breakdown", {})
            explanation = r.get("explanation", {})
            confidence = explanation.get("confidence", "N/A")
            rec = explanation.get("recommendation", "")[:100]
            skills = ", ".join(r.get("skills", [])[:8]) if r.get("skills") else ""

            df_data.append({
                "Rank": r["rank"],
                "Name": r["name"],
                "Overall Score": r["overall_score"],
                "Confidence": confidence,
                "Skills": skills,
                "Location": r.get("location", ""),
                "City": r.get("city", ""),
                "Semantic Fit": breakdown.get("semantic_similarity", 0),
                "Skills Match": breakdown.get("skills_match", 0),
                "Experience": breakdown.get("experience_match", 0),
                "Qualification": breakdown.get("qualification_match", 0),
                "English": breakdown.get("english_proficiency", 0),
                "Behavioral": breakdown.get("behavioral_signals", 0),
                "Location Match": breakdown.get("location_match", 0),
                "Sector Match": breakdown.get("sector_match", 0),
                "Recommendation": rec,
            })

        df = pd.DataFrame(df_data)

        csv_buf = io.BytesIO()
        df.to_csv(csv_buf, index=False)
        csv_buf.seek(0)

        json_buf = io.BytesIO()
        json_buf.write(json.dumps({"ranked_candidates": output}, indent=2, ensure_ascii=False).encode())
        json_buf.seek(0)

        col_a, col_b, col_c = st.columns(3)
        with col_a:
            st.download_button("📥 Download CSV", csv_buf, "ranked_candidates.csv", "text/csv")
        with col_b:
            st.download_button("📥 Download JSON", json_buf, "ranked_candidates.json", "application/json")
        with col_c:
            st.download_button("📥 Download Enriched JSON",
                               io.BytesIO(json.dumps(ranked[:50], indent=2, ensure_ascii=False).encode()),
                               "ranked_enriched.json", "application/json")

        st.markdown("<br/><h4>Preview (First 10)</h4>", unsafe_allow_html=True)
        st.dataframe(df.head(10), width="stretch", hide_index=True)
        st.markdown("</div>", unsafe_allow_html=True)

    st.sidebar.markdown("---")
    st.sidebar.markdown(f"""
    <div style="text-align:center;color:#5a6488;font-size:0.75rem;">
        <p>AI Candidate Ranking System<br/>Built for INDIA RUNS 2026</p>
    </div>
    """, unsafe_allow_html=True)


if __name__ == "__main__":
    main()
