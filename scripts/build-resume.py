"""Generate the public CV in a Harvard-style, ATS-friendly layout.

Design rules (Harvard Office of Career Services format + ATS parsing guidance):
- one column, no tables for layout beyond simple left/right rows, no graphics or icons
- standard PDF Times font, so every glyph extracts as real text
- standard section headings: SUMMARY, EXPERIENCE, OPEN SOURCE & PROJECTS, SKILLS, EDUCATION
- consistent "Mon YYYY" dates, right-aligned; contact details in the body, not a header/footer
- bullets start with an action verb, no personal pronouns
"""
import json
import sys
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

root = Path(sys.argv[1])
data = json.load(sys.stdin)
site = data["site"]

INK = colors.HexColor("#000000")
LINK = colors.HexColor("#1a34a8")
BODY = 10
LEAD = 11.9

styles = {
    "name": ParagraphStyle("name", fontName="Times-Bold", fontSize=20, leading=23, alignment=TA_CENTER, textColor=INK),
    "headline": ParagraphStyle("headline", fontName="Times-Roman", fontSize=11, leading=14, alignment=TA_CENTER, textColor=INK, spaceBefore=2),
    "contact": ParagraphStyle("contact", fontName="Times-Roman", fontSize=9.4, leading=12, alignment=TA_CENTER, textColor=INK),
    "section": ParagraphStyle("section", fontName="Times-Bold", fontSize=10.8, leading=12.5, textColor=INK, spaceBefore=6, spaceAfter=0.5),
    "body": ParagraphStyle("body", fontName="Times-Roman", fontSize=BODY, leading=LEAD, textColor=INK),
    "left": ParagraphStyle("left", fontName="Times-Roman", fontSize=BODY, leading=LEAD, textColor=INK),
    "right": ParagraphStyle("right", fontName="Times-Roman", fontSize=BODY, leading=LEAD, textColor=INK, alignment=2),
    "bullet": ParagraphStyle("bullet", fontName="Times-Roman", fontSize=BODY, leading=LEAD, textColor=INK, leftIndent=13, bulletIndent=3, spaceAfter=0.6),
}


def safe(text: str) -> str:
    return escape(text.replace("‑", "-"))


def link(url: str, label: str) -> str:
    return f'<link href="{escape(url)}" color="#000000">{safe(label)}</link>'


page_w = A4[0]
margin_x = 44
content_w = page_w - 2 * margin_x - 12  # frame has 6pt padding on each side


def row(left: str, right: str):
    """A left/right row (e.g. company | location). Two cells, read left to right."""
    t = Table(
        [[Paragraph(left, styles["left"]), Paragraph(right, styles["right"])]],
        colWidths=[content_w * 0.7, content_w * 0.3],
    )
    t.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    return t


def section(title: str):
    return [
        Paragraph(safe(title.upper()), styles["section"]),
        HRFlowable(width="100%", thickness=0.7, color=INK, spaceBefore=1, spaceAfter=3),
    ]


def bullets(items):
    return [Paragraph(safe(b), styles["bullet"], bulletText="•") for b in items]


# ---------------------------------------------------------------- content
resume = json.loads((root / "src/data/resume.json").read_text())
experience = resume["experience"]

# ---------------------------------------------------------------- story
story = []
story.append(Paragraph(safe(site["name"]), styles["name"]))
story.append(Paragraph(safe(site["role"] + " | Amman, Jordan"), styles["headline"]))
contact_bits = [
    safe(site["phone"]).replace(" ", "&nbsp;"),
    link("mailto:" + site["email"], site["email"]),
    link(site["linkedin"], "linkedin.com/in/saleh-almashni"),
    link(site["github"], "github.com/saleh2001k"),
    link("https://salehos.com", "salehos.com"),
]
story.append(Paragraph(" | ".join(contact_bits), styles["contact"]))

story += section("Summary")
story.append(Paragraph(safe(resume["summary"]), styles["body"]))

story += section("Experience")
for i, job in enumerate(experience):
    head = [
        row(f"<b>{safe(job['company'])}</b>", safe(job["location"])),
        row(f"<i>{safe(job['role'])}</i>", safe(job["dates"])),
    ]
    items = bullets(job["bullets"])
    story.append(KeepTogether(head + items[:1]))
    story += items[1:]
    if i < len(experience) - 1:
        story.append(Spacer(1, 4))

story += section("Open Source & Projects")
for project in resume["projects"]:
    name, url = project["name"], project["url"]
    title = link(url, name) if url else safe(name)
    story.append(Paragraph(f"<b>{title}</b>: {safe(project['description'])}", styles["bullet"], bulletText="•"))

story += section("Skills")
for skill in resume["skills"]:
    story.append(Paragraph(f"<b>{safe(skill['label'])}:</b> {safe(skill['value'])}", styles["body"]))

story += section("Education & Certifications")
for item in resume["education"]:
    story.append(row(f"<b>{safe(item['org'])}</b>, {safe(item['title'])}", safe(item["dates"])))
story.append(Paragraph(f"<b>Certifications:</b> {safe(resume['certifications'])}", styles["body"]))

# ---------------------------------------------------------------- build
filename = "Saleh_Al-Mashni_Resume_2026.pdf"
output = root / "public" / filename
doc = SimpleDocTemplate(
    str(output),
    pagesize=A4,
    leftMargin=margin_x,
    rightMargin=margin_x,
    topMargin=26,
    bottomMargin=22,
    title="Saleh Al-Mashni - Senior React Native & Frontend Developer - Resume",
    author="Saleh Al-Mashni",
    subject="Resume: React Native, iOS, Android, TypeScript, Next.js",
    keywords="React Native, TypeScript, iOS, Android, Swift, Kotlin, Expo, Next.js, React, Mobile Developer",
    creator="Saleh Al-Mashni",
)
doc.build(story)

from pypdf import PdfReader  # noqa: E402

reader = PdfReader(str(output))
pages = len(reader.pages)
if pages > 2:
    raise RuntimeError(f"Expected at most 2 pages, got {pages}. Tighten content before publishing.")
text = "\n".join(page.extract_text() for page in reader.pages)
for expected in ["Saleh", "EXPERIENCE", "SKILLS", "EDUCATION", "TGC", "Speedy Hire", "Aug 2026", "React Native", "react-native-rtl"]:
    assert expected.lower() in text.lower(), f"Missing expected content: {expected}"
print(f"Created and checked {output} ({pages} page{'s' if pages > 1 else ''}).")
