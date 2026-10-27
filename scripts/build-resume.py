"""Generate the public CV in a Harvard-style, ATS-friendly layout.

Design rules (Harvard Office of Career Services format + ATS parsing guidance):
- one column, no tables for layout beyond simple left/right rows, no graphics or icons
- standard PDF Times font, so every glyph extracts as real text
- standard section headings: SUMMARY, EXPERIENCE, OPEN SOURCE & PROJECTS, SKILLS, EDUCATION
- consistent "Mon YYYY" dates, right-aligned; contact details in the body, not a header/footer
- bullets start with an action verb, no personal pronouns
"""
import json
import shutil
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
experience = [
    {
        "company": "TGC",
        "location": "Amman, Jordan",
        "role": "Senior React Native & Frontend Developer",
        "dates": "Aug 2026 – Present",
        "bullets": [
            "Develop Aleena, a fashion commerce platform, across a React Native (Expo) mobile app, a Next.js storefront, and an admin dashboard in a shared Turborepo monorepo.",
            "Build native iOS (Swift) and Android (Kotlin) integrations: Apple Pay with PassKit, animated launch sequences, camera hardware controls, seasonal app icons, and Android predictive-back gestures.",
            "Implement runtime Arabic/English (RTL/LTR) switching without an app restart, Shopify customer authentication with OAuth PKCE, and MMKV-backed TanStack Query hydration for an instant first render.",
            "Create five shared packages (storefront, UI, theme, localization, configuration) that also power the dashboard’s live CMS preview.",
        ],
    },
    {
        "company": "Digital Gates",
        "location": "Amman, Jordan",
        "role": "Mobile Developer (React Native)",
        "dates": "Jun 2025 – Aug 2026",
        "bullets": [
            "Developed the Speedy Hire mobile app for iOS and Android in React Native and TypeScript for a UK equipment-hire client, from project setup through App Store and Google Play releases.",
            "Delivered live order tracking on Google Maps, off-hire and collection requests, invoices and online payments, a depot finder, and checkout with address management.",
            "Built QR and barcode asset inspection with VisionCamera, biometric login, and Azure AD B2C OAuth with secure token storage.",
            "Wrote native modules for splash-screen animation and in-app restart, added dark mode with Unistyles, upgraded React Native from 0.81 to 0.85, and automated builds with Azure Pipelines and fastlane.",
        ],
    },
    {
        "company": "We The Makers",
        "location": "Amman, Jordan",
        "role": "Full-Stack Software Developer",
        "dates": "Nov 2023 – Jun 2025",
        "bullets": [
            "Led and mentored the mobile team, setting code-review standards, branching strategy, and architecture decisions across concurrent client projects.",
            "Shipped React Native and Next.js products in fintech, delivery, loyalty, and automotive with offline support, push notifications, and bilingual Arabic/English RTL interfaces.",
            "Raised Lighthouse scores with Next.js ISR, image optimization, and bundle analysis; built GitHub Actions CI/CD pipelines for build, test, and deployment.",
        ],
    },
    {
        "company": "ASAC (Abdul Aziz Al Ghurair School of Advanced Computing)",
        "location": "Amman, Jordan",
        "role": "Full-Stack JavaScript Trainee",
        "dates": "Dec 2022 – Oct 2023",
        "bullets": [
            "Built REST APIs with Node.js and Express and front ends with React in an intensive full-stack program.",
        ],
    },
]

projects = [
    ("react-native-nitro-theme-transition", "https://github.com/saleh2001k/react-native-nitro-theme-transition",
     "16 native theme-change animations on Nitro Modules (Swift, Kotlin, Core Animation), no Skia needed."),
    ("react-native-rtl", "https://github.com/saleh2001k/react-native-rtl",
     "Runtime LTR/RTL switching for Fabric apps and native navigation chrome, with no restart."),
    ("react-native-silk-text, splash-flow, parallax-flow, pull-flow", "https://github.com/saleh2001k",
     "Native text animation (SwiftUI, Jetpack Compose), animated splash screens with an Expo plugin, parallax, and pull-to-refresh."),
    ("Balsam United", None,
     "Rebuilt a healthcare React Native app in 3 weeks vs. a projected 6 months; shipped to both stores."),
    ("MacHarmony", None,
     "SwiftUI macOS app with Stripe, Supabase auth, device-bound licensing, and Sparkle updates."),
]

skills = [
    ("Languages", "TypeScript, JavaScript, Swift, Kotlin, Objective-C, HTML, CSS"),
    ("Mobile", "React Native, Expo, TurboModules, Nitro Modules, Reanimated, Gesture Handler, SwiftUI, Jetpack Compose"),
    ("Web", "React, Next.js, TanStack Query, Zustand, Tailwind CSS, Turborepo, i18n and RTL"),
    ("Delivery", "Git, GitHub Actions, Azure Pipelines, fastlane, Xcode, Android Studio, App Store Connect, Play Console, AWS"),
]

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
story.append(
    Paragraph(
        safe(
            "Senior React Native and frontend developer with 4+ years building iOS, Android, and web products in TypeScript. "
            "Writes native Swift and Kotlin modules, has shipped 10+ apps to the App Store and Google Play, and maintains six open-source React Native packages."
        ),
        styles["body"],
    )
)

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
for name, url, desc in projects:
    title = link(url, name) if url else safe(name)
    story.append(Paragraph(f"<b>{title}</b>: {safe(desc)}", styles["bullet"], bulletText="•"))

story += section("Skills")
for label, value in skills:
    story.append(Paragraph(f"<b>{safe(label)}:</b> {safe(value)}", styles["body"]))

story += section("Education & Certifications")
story.append(row("<b>ASAC</b>, British Diploma in Software Engineering", "Oct 2023"))
story.append(row("<b>Amazon Web Services</b>, AWS re/Start Program", "Mar 2022 \u2013 Jul 2022"))
story.append(
    Paragraph(
        "<b>Certifications:</b> AWS Cloud Practitioner; Udacity Mobile Development; "
        "freeCodeCamp Front End Libraries, Responsive Web Design",
        styles["body"],
    )
)

# ---------------------------------------------------------------- build
filename = "Saleh_Al-Mashni_Resume_2026.pdf"
output = root / "output/pdf" / filename
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
for destination in [root / filename, root / "public" / filename]:
    shutil.copy2(output, destination)
print(f"Created and checked {output} ({pages} page{'s' if pages > 1 else ''}); synchronized root and public copies.")
