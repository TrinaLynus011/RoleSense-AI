"""Generate the presentation deck PDF for the AI Candidate Ranking System."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, ListFlowable, ListItem
)
from reportlab.platypus.frames import Frame
from reportlab.platypus.doctemplate import PageTemplate
import os

WIDTH, HEIGHT = A4
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")


class SlideDeck:
    def __init__(self, filename="deck.pdf"):
        self.output_path = os.path.join(OUTPUT_DIR, filename)
        self.doc = SimpleDocTemplate(
            self.output_path, pagesize=A4,
            leftMargin=30*mm, rightMargin=30*mm,
            topMargin=25*mm, bottomMargin=20*mm
        )
        self.styles = self._make_styles()
        self.story = []

    def _make_styles(self):
        ss = getSampleStyleSheet()
        ss.add(ParagraphStyle(
            "SlideTitle", parent=ss["Heading1"],
            fontSize=28, leading=34, spaceAfter=12,
            textColor=HexColor("#1a1a2e"), alignment=TA_CENTER,
        ))
        ss.add(ParagraphStyle(
            "Subtitle", parent=ss["Normal"],
            fontSize=16, leading=20, spaceAfter=20,
            textColor=HexColor("#4a4a6a"), alignment=TA_CENTER,
        ))
        ss.add(ParagraphStyle(
            "Body", parent=ss["Normal"],
            fontSize=13, leading=18, spaceAfter=8,
            textColor=HexColor("#2d2d2d"),
        ))
        ss.add(ParagraphStyle(
            "BodyCenter", parent=ss["Body"],
            alignment=TA_CENTER,
        ))
        ss.add(ParagraphStyle(
            "BulletPoint", parent=ss["Body"],
            leftIndent=20, bulletIndent=0,
            spaceBefore=2, spaceAfter=2,
        ))
        ss.add(ParagraphStyle(
            "CodeBlock", parent=ss["Code"],
            fontSize=9, leading=12,
            backColor=HexColor("#f0f0f0"),
            leftIndent=10,
        ))
        ss.add(ParagraphStyle(
            "TableHeader", parent=ss["Normal"],
            fontSize=11, leading=14,
            textColor=white, alignment=TA_CENTER,
        ))
        ss.add(ParagraphStyle(
            "TableCell", parent=ss["Normal"],
            fontSize=10, leading=13, alignment=TA_CENTER,
        ))
        return ss

    def slide_title(self, text):
        self.story.append(Paragraph(text, self.styles["SlideTitle"]))

    def slide_subtitle(self, text):
        self.story.append(Paragraph(text, self.styles["Subtitle"]))

    def body(self, text):
        self.story.append(Paragraph(text, self.styles["Body"]))

    def body_center(self, text):
        self.story.append(Paragraph(text, self.styles["BodyCenter"]))

    def bullet(self, text):
        self.story.append(Paragraph(f"• {text}", self.styles["BulletPoint"]))

    def code(self, text):
        self.story.append(Paragraph(text.replace("\n", "<br/>"), self.styles["CodeBlock"]))

    def spacer(self, h=6):
        self.story.append(Spacer(1, h))

    def table(self, data, col_widths=None, header=True):
        style_cmds = [
            ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#cccccc")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ]
        if header:
            style_cmds.extend([
                ("BACKGROUND", (0, 0), (-1, 0), HexColor("#1a1a2e")),
                ("TEXTCOLOR", (0, 0), (-1, 0), white),
                ("FONTSIZE", (0, 0), (-1, 0), 11),
            ])
        t = Table(data, colWidths=col_widths, repeatRows=1 if header else 0)
        t.setStyle(TableStyle(style_cmds))
        self.story.append(t)

    def new_slide(self):
        self.story.append(Spacer(1, 10))

    def page_break(self):
        self.story.append(PageBreak())

    def build(self):
        self.doc.build(self.story)
        return self.output_path


def build_deck():
    d = SlideDeck()

    # --- Slide 1: Title ---
    d.slide_title("AI Candidate Ranking System")
    d.slide_subtitle("INDIA RUNS — Redrob AI × Hack2skill Hackathon")
    d.spacer(40)
    d.body_center("An AI-powered system that ranks candidates the way a great recruiter would —")
    d.body_center("by understanding who genuinely fits the role, not by matching keywords.")
    d.spacer(30)
    d.body_center("Track 1: AI-Powered Candidate Ranking")

    # --- Slide 2: Problem ---
    d.page_break()
    d.slide_title("The Problem")
    d.spacer(20)
    d.body("Recruiters review hundreds of profiles and still miss the right person.")
    d.body("Not because talent isn't there — but because keyword filters can't see what matters.")
    d.spacer(10)
    d.bullet("Keyword matching misses context and intent")
    d.bullet("Behavioral signals (urgency, activity) are ignored")
    d.bullet("No explainable scoring — recruiter can't trust black-box ranking")
    d.bullet("Indian hiring platforms need India-specific understanding")

    # --- Slide 3: Solution ---
    d.page_break()
    d.slide_title("Our Solution")
    d.spacer(10)
    d.table([
        ["Capability", "Approach"],
        ["Understands job context", "Semantic embeddings (sentence-transformers)"],
        ["Goes beyond keywords", "Synonym-aware skill + sector matching"],
        ["Full candidate picture", "8 scoring dimensions"],
        ["Explainable scores", "Transparent breakdown per candidate"],
        ["India-first", "Built for Indian education, languages, sectors"],
        ["Flexible", "Works with any candidate data source"],
    ], col_widths=[140, 320])

    # --- Slide 4: Architecture ---
    d.page_break()
    d.slide_title("System Architecture")
    d.spacer(10)
    arch_text = """
    <br/>
    <b>Job Description</b> → <b>JD Parser</b> → Extract skills, sector, location, experience<br/>
    <br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br/>
    <br/>
    <b>Embedding Engine</b> (sentence-transformers all-MiniLM-L6-v2)<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br/>
    <br/>
    <b>Similarity Computation</b> (cosine similarity — 384d embeddings)<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br/>
    <br/>
    <b>Hybrid Scorer</b> (8 weighted dimensions)<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br/>
    <br/>
    <b>Ranker</b> → <b>Ranked Candidate Shortlist</b><br/>
    """
    d.body(arch_text)

    # --- Slide 5: Scoring ---
    d.page_break()
    d.slide_title("Scoring Dimensions (Weighted Hybrid)")
    d.spacer(10)
    d.table([
        ["Dimension", "Weight", "What It Measures"],
        ["Semantic Similarity", "30%", "Embedding cosine similarity — understands context"],
        ["Skills Match", "20%", "Direct + synonym-aware skill matching"],
        ["Experience Match", "15%", "Years vs requirements; handles fresher/senior"],
        ["Qualification", "10%", "Education level alignment"],
        ["English Proficiency", "5%", "No → Basic → Good → Fluent"],
        ["Behavioral Signals", "10%", "Urgency, resume, verification, activity"],
        ["Location Match", "5%", "City/location alignment"],
        ["Sector Match", "5%", "Industry sector relevance"],
    ], col_widths=[130, 70, 280])

    d.spacer(15)
    d.body("<b>Hybrid Score</b> = 0.30×Semantic + 0.20×Skills + 0.15×Experience + 0.10×Qualification + 0.05×English + 0.10×Behavioral + 0.05×Location + 0.05×Sector")

    # --- Slide 6: Semantic Understanding ---
    d.page_break()
    d.slide_title("Semantic Understanding Beyond Keywords")
    d.spacer(10)
    d.body("<b>Why embeddings beat keyword matching:</b>")
    d.spacer(5)
    d.bullet("'Delivery Executive' matches 'Bike Rider + Packing' semantically — even with zero keyword overlap")
    d.bullet("Model: sentence-transformers <b>all-MiniLM-L6-v2</b> (384-dim normalized embeddings)")
    d.bullet("Cosine similarity in embedding space captures role relevance")
    d.bullet("Handles synonyms: 'security guard' ↔ 'watchman', 'sales' ↔ 'business development'")
    d.spacer(10)
    d.code("""
    # Example: job text → 384-dim vector
    job_vec = model.encode("Delivery Executive in Mumbai")
    cand_vec = model.encode("Bike Rider, Packing, Mumbai")
    similarity = cosine_similarity(job_vec, cand_vec)  # High match
    """)

    # --- Slide 7: Data ---
    d.page_break()
    d.slide_title("Datasets")
    d.spacer(10)
    d.table([
        ["Dataset", "Source", "Size", "Type"],
        ["WorkIndia", "Real candidate profiles", "100", "Blue/grey collar — skills, experience, behavioral signals"],
        ["Role Radar Profiles", "438 synthetic + 202 real", "640", "Professional profiles with roles, skills, domains"],
        ["Scraped Jobs", "Real Indian job postings", "2,500", "Full JD with title, description, location, seniority"],
        ["Gold Labels", "Expert-annotated pairs", "108", "Ground truth for evaluation"],
    ], col_widths=[110, 100, 60, 220])

    d.spacer(15)
    d.body("WorkIndia candidates include: skills, experience, qualification, sectors, languages, English level, location, urgency flag, resume flag, mobile verification, last seen timestamp, hot lead status.")

    # --- Slide 8: Sample Output ---
    d.page_break()
    d.slide_title("Sample Ranking Output")
    d.spacer(5)
    d.body_center("<b>Job:</b> Delivery Executive — Mumbai")
    d.spacer(5)
    d.table([
        ["Rank", "Name", "Score"],
        ["#1", "Sumit Ghorpade", "0.6940"],
        ["#2", "Jeroy Rodrigues", "0.6331"],
        ["#3", "Abhishek Suresh Gotad", "0.6322"],
        ["#4", "Azman Khan", "0.6202"],
        ["#5", "Aalok Jitendra Singh", "0.6172"],
    ], col_widths=[80, 280, 120])

    d.spacer(10)
    d.body("Each candidate includes an <b>explainable score breakdown</b>:")
    d.spacer(3)
    d.code("""
    "score_breakdown": {
      "semantic_similarity": 0.6466,
      "skills_match": 1.0,
      "experience_match": 0.8,
      "qualification_match": 0.2,
      "english_proficiency": 0.6,
      "behavioral_signals": 0.3,
      "location_match": 1.0,
      "sector_match": 1.0
    }""")

    # --- Slide 9: Why This Works ---
    d.page_break()
    d.slide_title("Why This Approach Works")
    d.spacer(10)
    d.bullet("<b>Beyond keywords</b> — Semantic embeddings understand role context, not just words")
    d.bullet("<b>Holistic picture</b> — 8 scoring dimensions cover skills, experience, education, English, behavior, location, sector")
    d.bullet("<b>Explainable</b> — Recruiters see <i>why</i> each candidate ranks where they do, building trust")
    d.bullet("<b>India-first</b> — Built for Indian platforms (WorkIndia), education levels (10th Pass, 12th Pass), languages (Hindi, Marathi, etc.), and job sectors (delivery, security, sales)")
    d.bullet("<b>Hybrid strength</b> — Neural embeddings capture nuance; rule-based matching provides reliability")
    d.bullet("<b>Flexible architecture</b> — Works with any data source; pluggable scoring dimensions")

    # --- Slide 10: Tech Stack ---
    d.page_break()
    d.slide_title("Technology Stack")
    d.spacer(10)
    d.table([
        ["Component", "Technology"],
        ["Embeddings", "sentence-transformers (all-MiniLM-L6-v2)"],
        ["Similarity", "Cosine similarity (numpy)"],
        ["Scoring Engine", "Custom hybrid (Python)"],
        ["Data Processing", "pandas, json"],
        ["CLI Interface", "Python argparse"],
        ["PDF Generation", "reportlab"],
    ], col_widths=[180, 300])

    d.spacer(15)
    d.body("<b>Why all-MiniLM-L6-v2?</b>")
    d.bullet("384-dim embeddings — good balance of speed and accuracy")
    d.bullet("6-layer transformer — fast inference on CPU")
    d.bullet("Multilingual support — handles Indian English and Hinglish")
    d.bullet("Lightweight (80MB) — runs on any machine")

    # --- Slide 11: How to Run ---
    d.page_break()
    d.slide_title("How to Run")
    d.spacer(10)
    d.code("""
    # Install dependencies
    pip install -r requirements.txt
    
    # Rank WorkIndia candidates for default JD
    python src/main.py --source workindia --top-n 10
    
    # Custom job description
    python src/main.py --source workindia \\
        --jd data/job_description_sales.txt --top-n 10
    
    # Use Role Radar dataset
    python src/main.py --source jd_dataset \\
        --jd-index 0 --top-n 10
    """)
    d.spacer(10)
    d.body("Output: <b>output/ranked_candidates.json</b> — ranked list with scores")

    # --- Slide 12: Future ---
    d.page_break()
    d.slide_title("Future Enhancements")
    d.spacer(10)
    d.bullet("<b>LLM-based ranking</b> — Claude/GPT for deep reasoning on nuanced fit")
    d.bullet("<b>Vector database</b> — FAISS/Chroma for large-scale retrieval (10K+ profiles)")
    d.bullet("<b>Resume parsing</b> — PDF/DOCX extraction for direct resume upload")
    d.bullet("<b>Bias detection</b> — Fairness metrics across age, gender, location demographics")
    d.bullet("<b>Recruiter dashboard</b> — Streamlit/Gradio UI for interactive review")
    d.bullet("<b>REST API</b> — FastAPI endpoint for ATS integration")
    d.bullet("<b>Feedback loop</b> — Recruiter feedback tunes weights over time")

    # --- Slide 13: Thank You ---
    d.page_break()
    d.spacer(60)
    d.slide_title("Thank You")
    d.spacer(20)
    d.subtitle = ParagraphStyle("Subtitle2", parent=d.styles["Subtitle"], fontSize=18)
    d.story.append(Paragraph("Built for INDIA RUNS — Redrob AI × Hack2skill", d.subtitle))
    d.spacer(15)
    d.body_center("<b>GitHub:</b> github.com/yourusername/candidate-rank-ai")
    d.spacer(10)
    d.body_center("Clean • Modular • Explainable • India-first")

    path = d.build()
    print(f"Deck created: {path}")
    return path


if __name__ == "__main__":
    build_deck()
