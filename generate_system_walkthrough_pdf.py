import os
import sys
from PIL import Image, ImageDraw, ImageFont
import reportlab
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

OUTPUT_PDF_PATH = "/Users/hari03/phoenix-fitness-academy/Phoenix_Fitness_Centre_System_Walkthrough_and_Flowchart.pdf"
ARTIFACT_PDF_PATH = "/Users/hari03/.gemini/antigravity/brain/67f08347-9e87-44ef-9c40-18e9fa1e9cc6/Phoenix_Fitness_Centre_System_Walkthrough_and_Flowchart.pdf"
SCRATCH_DIR = "/Users/hari03/.gemini/antigravity/brain/67f08347-9e87-44ef-9c40-18e9fa1e9cc6/scratch"

os.makedirs(SCRATCH_DIR, exist_ok=True)

# ----------------------------------------------------------------------
# HELPER: DRAW CRISP FLOWCHART DIAGRAMS WITH PILLOW
# ----------------------------------------------------------------------
def get_font(size, bold=False):
    font_path = "/System/Library/Fonts/Supplemental/Arial.ttf"
    if bold:
        # Try bold font if available
        bold_path = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
        if os.path.exists(bold_path):
            return ImageFont.truetype(bold_path, size)
    if os.path.exists(font_path):
        return ImageFont.truetype(font_path, size)
    return ImageFont.load_default()

def draw_rounded_card(draw, box, radius=12, fill="#18181B", outline="#3F3F46", width=2):
    x1, y1, x2, y2 = box
    draw.rounded_rectangle([x1, y1, x2, y2], radius=radius, fill=fill, outline=outline, width=width)

def draw_arrow(draw, start, end, color="#EF4444", width=3, arrow_size=10):
    x1, y1 = start
    x2, y2 = end
    draw.line([x1, y1, x2, y2], fill=color, width=width)
    import math
    angle = math.atan2(y2 - y1, x2 - x1)
    # Arrow head
    p1 = (x2 - arrow_size * math.cos(angle - math.pi / 6), y2 - arrow_size * math.sin(angle - math.pi / 6))
    p2 = (x2 - arrow_size * math.cos(angle + math.pi / 6), y2 - arrow_size * math.sin(angle + math.pi / 6))
    draw.polygon([end, p1, p2], fill=color)

# DIAGRAM 1: Member Lifecycle & Expiry-to-Renewal Flowchart
def generate_diagram_1():
    img_w, img_h = 1600, 1050
    img = Image.new("RGBA", (img_w, img_h), "#09090B")
    draw = ImageDraw.Draw(img)

    f_title = get_font(34, bold=True)
    f_sub = get_font(20, bold=False)
    f_box_h = get_font(22, bold=True)
    f_box_p = get_font(18, bold=False)
    f_badge = get_font(16, bold=True)

    # Title header banner
    draw_rounded_card(draw, (40, 30, img_w - 40, 110), radius=16, fill="#1C1917", outline="#991B1B", width=3)
    draw.text((60, 42), "FLOWCHART 1: MEMBER LIFECYCLE, EXPIRY ENGINE & AUTOMATIC RENEWAL", fill="#FFFFFF", font=f_title)
    draw.text((60, 80), "Real-time state transitions from enrollment to progressive expiry alerts and instant 1-click renewal", fill="#A1A1AA", font=f_sub)

    # Box 1: Enrollment
    draw_rounded_card(draw, (60, 150, 480, 320), radius=14, fill="#18181B", outline="#3B82F6", width=3)
    draw.text((80, 168), "1. NEW MEMBER ENROLLMENT", fill="#60A5FA", font=f_box_h)
    lines1 = [
        "• Admin enters Name, Mobile, Village, Plan",
        "• Unique ID Auto-Assigned (PXM-1001...)",
        "• Status: ACTIVE  |  Payment: PAID",
        "• Vector PDF Receipt generated on-the-fly",
        "• Instant Welcome Email notification triggered"
    ]
    y_text = 205
    for l in lines1:
        draw.text((80, y_text), l, fill="#E4E4E7", font=f_box_p)
        y_text += 22

    # Arrow 1 -> 2
    draw_arrow(draw, (480, 235), (570, 235), color="#EF4444", width=4)

    # Box 2: Daily Engine
    draw_rounded_card(draw, (570, 150, 1020, 320), radius=14, fill="#18181B", outline="#E11D48", width=3)
    draw.text((590, 168), "2. REAL-TIME EXPIRATION ENGINE", fill="#F43F5E", font=f_box_h)
    lines2 = [
        "• Daily dynamic formula: diffDays = (endDate - today)",
        "• Normalizes midnight timestamps to eliminate UTC/IST drift",
        "• Continuously evaluates all active subscriptions",
        "• Feeds telemetry counters & notification feeds",
        "• Auto-detects expired records (endDate < today)"
    ]
    y_text = 205
    for l in lines2:
        draw.text((590, y_text), l, fill="#E4E4E7", font=f_box_p)
        y_text += 22

    # Arrow 2 -> 3
    draw_arrow(draw, (1020, 235), (1110, 235), color="#EF4444", width=4)

    # Box 3: Active Healthy
    draw_rounded_card(draw, (1110, 150, 1540, 320), radius=14, fill="#064E3B", outline="#10B981", width=3)
    draw.text((1130, 168), "ACTIVE MEMBERSHIP", fill="#34D399", font=f_box_h)
    lines3 = [
        "• diffDays > 3 Days Left",
        "• Unrestricted gym access",
        "• Displayed in Active Subscriptions",
        "• No action required from desk"
    ]
    y_text = 210
    for l in lines3:
        draw.text((1130, y_text), l, fill="#ECFDF5", font=f_box_p)
        y_text += 24

    # Branching down to Expiry Progression Stages (Row 2)
    draw_arrow(draw, (795, 320), (795, 390), color="#F59E0B", width=4)

    # 4 Cards for Progression: 3-Day, 2-Day, 1-Day/Today, Expired
    card_w = 340
    gap = 40
    start_x = 60

    # Stage A: 3 Days
    x_a = start_x
    draw_rounded_card(draw, (x_a, 400, x_a + card_w, 580), radius=12, fill="#1C1917", outline="#F59E0B", width=2)
    draw.text((x_a + 20, 415), "STAGE 1: 3 DAYS LEFT", fill="#FBBF24", font=f_box_h)
    draw.text((x_a + 20, 448), "⏰ Title: Expires in 3 Days", fill="#FEF3C7", font=f_badge)
    draw.text((x_a + 20, 478), "• Warning alert in Notifications", fill="#D4D4D8", font=f_box_p)
    draw.text((x_a + 20, 506), "• 1-Click Web WhatsApp Reminder", fill="#D4D4D8", font=f_box_p)
    draw.text((x_a + 20, 534), "• UPI: +91 8015552425", fill="#D4D4D8", font=f_box_p)

    # Stage B: 2 Days
    x_b = x_a + card_w + gap
    draw_rounded_card(draw, (x_b, 400, x_b + card_w, 580), radius=12, fill="#1C1917", outline="#F59E0B", width=2)
    draw.text((x_b + 20, 415), "STAGE 2: 2 DAYS LEFT", fill="#FBBF24", font=f_box_h)
    draw.text((x_b + 20, 448), "⏳ Title: Expires in 2 Days", fill="#FEF3C7", font=f_badge)
    draw.text((x_b + 20, 478), "• Automatic dynamic timeline bump", fill="#D4D4D8", font=f_box_p)
    draw.text((x_b + 20, 506), "• Tailored countdown message", fill="#D4D4D8", font=f_box_p)
    draw.text((x_b + 20, 534), "• Desk alert for follow-up", fill="#D4D4D8", font=f_box_p)

    # Stage C: 1 Day / Today
    x_c = x_b + card_w + gap
    draw_rounded_card(draw, (x_c, 400, x_c + card_w, 580), radius=12, fill="#271010", outline="#EF4444", width=2)
    draw.text((x_c + 20, 415), "STAGE 3: 1 DAY / TODAY", fill="#F87171", font=f_box_h)
    draw.text((x_c + 20, 448), "🚨 Title: Expires Tomorrow!", fill="#FEE2E2", font=f_badge)
    draw.text((x_c + 20, 478), "• 'Expires TODAY!' at 0 days", fill="#D4D4D8", font=f_box_p)
    draw.text((x_c + 20, 506), "• High-priority red CRITICAL badge", fill="#D4D4D8", font=f_box_p)
    draw.text((x_c + 20, 534), "• Urgent renewal call-to-action", fill="#D4D4D8", font=f_box_p)

    # Stage D: Expired
    x_d = x_c + card_w + gap
    draw_rounded_card(draw, (x_d, 400, x_d + card_w, 580), radius=12, fill="#3F1212", outline="#DC2626", width=3)
    draw.text((x_d + 20, 415), "STAGE 4: EXPIRED", fill="#FCA5A5", font=f_box_h)
    draw.text((x_d + 20, 448), "🚨 Title: Membership Expired", fill="#FECACA", font=f_badge)
    draw.text((x_d + 20, 478), "• Auto-badged as EXPIRED", fill="#D4D4D8", font=f_box_p)
    draw.text((x_d + 20, 506), "• Filterable in Members Directory", fill="#D4D4D8", font=f_box_p)
    draw.text((x_d + 20, 534), "• Direct 'Renew' action button", fill="#D4D4D8", font=f_box_p)

    # Arrows leading from all stages down to Renewal Trigger
    draw_arrow(draw, (x_a + card_w//2, 580), (600, 670), color="#E11D48", width=3)
    draw_arrow(draw, (x_b + card_w//2, 580), (700, 670), color="#E11D48", width=3)
    draw_arrow(draw, (x_c + card_w//2, 580), (880, 670), color="#E11D48", width=3)
    draw_arrow(draw, (x_d + card_w//2, 580), (980, 670), color="#E11D48", width=3)

    # Box 4: 1-Click Renewal Modal
    draw_rounded_card(draw, (360, 670, 1240, 840), radius=16, fill="#1E1B4B", outline="#6366F1", width=3)
    draw.text((390, 690), "3. INSTANT RENEWAL ACTION (RenewModal.jsx)", fill="#A5B4FC", font=f_title)
    lines_rn = [
        "• Launched with 1-click from Members Directory, Notification Cards, or Dashboard Quick Actions",
        "• Choose Plan Duration: Monthly (+1m), Quarterly (+3m), Half-Yearly (+6m), Yearly (+1yr)",
        "• Dynamic End-Date Calculation: Extends from TODAY if expired, or extends from current endDate if active",
        "• Select Payment Mode: UPI (phoenixgym.vkp@oksbi / 8015552425) / Cash / Card"
    ]
    y_text = 735
    for l in lines_rn:
        draw.text((390, y_text), l, fill="#E0E7FF", font=f_box_p)
        y_text += 24

    # Arrow 4 -> 5
    draw_arrow(draw, (800, 840), (800, 890), color="#10B981", width=4)

    # Box 5: Confirmation & Auto-Update
    draw_rounded_card(draw, (60, 890, img_w - 60, 1020), radius=14, fill="#064E3B", outline="#10B981", width=3)
    draw.text((90, 908), "4. AUTOMATIC POST-RENEWAL STATE UPDATE & TELEMETRY LIFECYCLE", fill="#34D399", font=f_title)
    lines_conf = [
        "✔ Status reset to ACTIVE (Expired tag cleared immediately)  |  ✔ endDate updated with new extended validity",
        "✔ membershipType set to 'Renewal'  |  ✔ Transaction logged to Payments Ledger (TXN-XXX)",
        "✔ Previous expiration notification cleared from Alert Center  |  ✔ Today's Renewals counter incremented & synced to Cloud"
    ]
    y_text = 948
    for l in lines_conf:
        draw.text((90, y_text), l, fill="#ECFDF5", font=f_box_p)
        y_text += 22

    path = os.path.join(SCRATCH_DIR, "flowchart_member_lifecycle.png")
    img.save(path, "PNG")
    return path

# DIAGRAM 2: Notification & Reminder Engine
def generate_diagram_2():
    img_w, img_h = 1600, 950
    img = Image.new("RGBA", (img_w, img_h), "#09090B")
    draw = ImageDraw.Draw(img)

    f_title = get_font(34, bold=True)
    f_sub = get_font(20, bold=False)
    f_box_h = get_font(22, bold=True)
    f_box_p = get_font(18, bold=False)

    # Header banner
    draw_rounded_card(draw, (40, 30, img_w - 40, 110), radius=16, fill="#1C1917", outline="#991B1B", width=3)
    draw.text((60, 42), "FLOWCHART 2: MULTI-CHANNEL AUTOMATED REMINDER ENGINE", fill="#FFFFFF", font=f_title)
    draw.text((60, 80), "Automated 08:30 IST scheduler, duplicate suppression filter, and dual WhatsApp / Gmail dispatch", fill="#A1A1AA", font=f_sub)

    # Step 1: Trigger Sources
    draw_rounded_card(draw, (60, 160, 480, 400), radius=14, fill="#18181B", outline="#E11D48", width=3)
    draw.text((80, 185), "TRIGGER SOURCES", fill="#FB7185", font=f_box_h)
    lines_tr = [
        "A. Scheduled Automated Cron:",
        "   Daily at 08:30 AM IST (Google Apps",
        "   Script & Vercel / Node Server)",
        "",
        "B. Admin On-Demand Trigger:",
        "   'Send Reminders' button on Dashboard",
        "   or 1-click 'Send' on Alert Card"
    ]
    y_text = 225
    for l in lines_tr:
        draw.text((80, y_text), l, fill="#F4F4F5", font=f_box_p)
        y_text += 22

    # Arrow 1 -> 2
    draw_arrow(draw, (480, 280), (570, 280), color="#E11D48", width=4)

    # Step 2: Engine & Deduplication Filter
    draw_rounded_card(draw, (570, 160, 1030, 400), radius=14, fill="#18181B", outline="#F59E0B", width=3)
    draw.text((590, 185), "AUDIENCE FILTER & DEDUPLICATION", fill="#FBBF24", font=f_box_h)
    lines_fl = [
        "1. Filter Members: Expirations in 3, 2, or 1 Days & Today",
        "2. Daily Duplicate Guard Check:",
        "   Checks notification ledger (reminders log)",
        "   If reminder already dispatched to this phone/email today",
        "   --> DUPLICATE SUPPRESSED (No spam / double alert)",
        "3. If fresh --> Formats personalized reminder payload"
    ]
    y_text = 225
    for l in lines_fl:
        draw.text((590, y_text), l, fill="#F4F4F5", font=f_box_p)
        y_text += 22

    # Split Arrow to 2 Channels
    draw_arrow(draw, (1030, 240), (1110, 220), color="#10B981", width=4)
    draw_arrow(draw, (1030, 320), (1110, 340), color="#3B82F6", width=4)

    # Step 3A: WhatsApp Channel
    draw_rounded_card(draw, (1110, 150, 1540, 500), radius=14, fill="#064E3B", outline="#10B981", width=3)
    draw.text((1130, 175), "CHANNEL 1: WHATSAPP WEB", fill="#34D399", font=f_box_h)
    lines_wa = [
        "• Deep-linked direct URL:",
        "  web.whatsapp.com/send?phone=...&text=...",
        "• Dynamic pre-filled professional text",
        "• Includes Member ID, Plan, Expiry Date",
        "• UPI ID: phoenixgym.vkp@oksbi",
        "• Contact: +91 8015552425",
        "• Single-click opens chat with full draft ready!",
        "• Marks 'Sent' badge in WhatsApp logs"
    ]
    y_text = 215
    for l in lines_wa:
        draw.text((1130, y_text), l, fill="#ECFDF5", font=f_box_p)
        y_text += 22

    # Step 3B: Email & Vector PDF Channel
    draw_rounded_card(draw, (60, 480, 1030, 720), radius=14, fill="#1E1B4B", outline="#6366F1", width=3)
    draw.text((80, 505), "CHANNEL 2: AUTOMATED GMAIL SMTP & VECTOR PDF INVOICE", fill="#A5B4FC", font=f_title)
    lines_em = [
        "• Sender account: phoenixgym.vkp@gmail.com (Google App Password / OAuth)",
        "• High-resolution HTML template with Phoenix Fitness Centre branding & guidelines",
        "• Generates dynamic Vector PDF Invoice attachment directly in memory",
        "• Features invoice number, tax summary, QR / UPI payment instructions & gym timings",
        "• Desk & Emergency Support line: +91 8015552425"
    ]
    y_text = 550
    for l in lines_em:
        draw.text((80, y_text), l, fill="#E0E7FF", font=f_box_p)
        y_text += 24

    # Connecting Arrow from both down to Ledger Audit
    draw_arrow(draw, (1325, 500), (1325, 780), color="#10B981", width=3)
    draw_arrow(draw, (545, 720), (545, 780), color="#6366F1", width=3)

    # Step 4: Ledger Audit & Monitor
    draw_rounded_card(draw, (60, 780, img_w - 60, 910), radius=14, fill="#18181B", outline="#E11D48", width=3)
    draw.text((90, 800), "AUDIT LOGGING, DISPATCH METRICS & TELEMETRY MONITOR", fill="#F43F5E", font=f_title)
    lines_aud = [
        "✔ Updates Reminder Logs Monitor on Dashboard (Sent, Pending, Failed counters)",
        "✔ Displays in Recent WhatsApp Dispatches Logs with live timestamp & client phone",
        "✔ Renders '✓ Reminder Sent' status badge on row in Members Directory"
    ]
    y_text = 840
    for l in lines_aud:
        draw.text((90, y_text), l, fill="#E4E4E7", font=f_box_p)
        y_text += 22

    path = os.path.join(SCRATCH_DIR, "flowchart_notification_engine.png")
    img.save(path, "PNG")
    return path

# DIAGRAM 3: Full System Architecture & Data Sync
def generate_diagram_3():
    img_w, img_h = 1600, 950
    img = Image.new("RGBA", (img_w, img_h), "#09090B")
    draw = ImageDraw.Draw(img)

    f_title = get_font(34, bold=True)
    f_sub = get_font(20, bold=False)
    f_box_h = get_font(22, bold=True)
    f_box_p = get_font(18, bold=False)

    # Header banner
    draw_rounded_card(draw, (40, 30, img_w - 40, 110), radius=16, fill="#1C1917", outline="#991B1B", width=3)
    draw.text((60, 42), "FLOWCHART 3: COMPLETE SYSTEM ARCHITECTURE & DUAL-SYNC PIPELINE", fill="#FFFFFF", font=f_title)
    draw.text((60, 80), "High-availability architecture combining Client Edge SPA, Local Storage, Cloud Sync & Node Services", fill="#A1A1AA", font=f_sub)

    # Layer 1: Presentation Layer
    draw_rounded_card(draw, (60, 160, img_w - 60, 360), radius=14, fill="#18181B", outline="#3B82F6", width=3)
    draw.text((90, 185), "CLIENT APPLICATION LAYER (Vercel Production Edge: frontend-jet-psi-40.vercel.app)", fill="#60A5FA", font=f_title)
    draw.text((90, 225), "• Single Page Application (SPA) built with React 18, Vite 8, and Tailwind CSS", fill="#E4E4E7", font=f_box_p)
    draw.text((90, 252), "• Responsive multi-device layout (optimally tuned for Laptops, Desktops, iPads, and Mobile)", fill="#E4E4E7", font=f_box_p)
    draw.text((90, 279), "• Modules: Dashboard Telemetry, Members Directory, Member Enrollment, Billing & Receipts, Alert Center", fill="#E4E4E7", font=f_box_p)
    draw.text((90, 306), "• In-Browser Vector PDF Generator (Pure client-side rendering without external latency)", fill="#E4E4E7", font=f_box_p)

    # Down arrow to Data Storage & Sync Layer
    draw_arrow(draw, (400, 360), (400, 430), color="#E11D48", width=4)
    draw_arrow(draw, (1200, 360), (1200, 430), color="#10B981", width=4)

    # Layer 2A: Local Storage Cache
    draw_rounded_card(draw, (60, 430, 750, 680), radius=14, fill="#1C1917", outline="#F59E0B", width=3)
    draw.text((90, 455), "CLIENT PERSISTENCE & OFFLINE CACHE", fill="#FBBF24", font=f_box_h)
    lines_loc = [
        "• localStorage Keys: phoenix_gym_members, payments",
        "• Instant zero-latency UI updates upon any add/edit/renewal",
        "• Maintains full session even during network interruptions",
        "• Tracks deleted member IDs to preserve deletion integrity",
        "• Stores notification cleared state preferences"
    ]
    y_text = 495
    for l in lines_loc:
        draw.text((90, y_text), l, fill="#F4F4F5", font=f_box_p)
        y_text += 24

    # Layer 2B: Cloud Sync Pipeline
    draw_rounded_card(draw, (850, 430, img_w - 60, 680), radius=14, fill="#064E3B", outline="#10B981", width=3)
    draw.text((880, 455), "GOOGLE SHEETS LIVE CLOUD DATABASE", fill="#34D399", font=f_box_h)
    lines_cld = [
        "• Google Apps Script Serverless Endpoint (Code.gs)",
        "• Real-time synchronization across multiple devices",
        "• Window Focus Sync: Triggers automatically when admin switches windows",
        "• 6-Second Auto-Poll Loop ensures desk & mobile sync seamlessly",
        "• Single Source of Truth for members, subscriptions, and financial ledger"
    ]
    y_text = 495
    for l in lines_cld:
        draw.text((880, y_text), l, fill="#ECFDF5", font=f_box_p)
        y_text += 24

    # Double Arrow between Local and Cloud
    draw_arrow(draw, (750, 555), (850, 555), color="#34D399", width=4)
    draw_arrow(draw, (850, 585), (750, 585), color="#FBBF24", width=4)

    # Down arrow to Backend Microservices
    draw_arrow(draw, (img_w//2, 680), (img_w//2, 750), color="#E11D48", width=4)

    # Layer 3: Backend Services
    draw_rounded_card(draw, (60, 750, img_w - 60, 910), radius=14, fill="#18181B", outline="#E11D48", width=3)
    draw.text((90, 775), "BACKEND MICROSERVICES & AUTOMATION (Express.js + Nodemailer)", fill="#F43F5E", font=f_title)
    lines_be = [
        "• Express REST API services (/api/members, /api/payments, /api/notifications)",
        "• Daily Cron Scheduler: runs automated background reminder dispatches every morning at 08:30 IST",
        "• Nodemailer SMTP Transporter connected directly to official gym email: phoenixgym.vkp@gmail.com",
        "• Standalone Vector PDF engine generates server-side invoice attachments for outgoing email reminders"
    ]
    y_text = 815
    for l in lines_be:
        draw.text((90, y_text), l, fill="#E4E4E7", font=f_box_p)
        y_text += 22

    path = os.path.join(SCRATCH_DIR, "flowchart_system_architecture.png")
    img.save(path, "PNG")
    return path

# ----------------------------------------------------------------------
# REPORTLAB PDF GENERATOR
# ----------------------------------------------------------------------
def generate_pdf():
    print("Generating flowchart diagram images...")
    d1_path = generate_diagram_1()
    d2_path = generate_diagram_2()
    d3_path = generate_diagram_3()

    print("Diagrams generated successfully!")
    print("Assembling professional ReportLab PDF...")

    doc = SimpleDocTemplate(
        OUTPUT_PDF_PATH,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom typography & colors
    crimson = colors.HexColor("#991B1B")
    dark_crimson = colors.HexColor("#7F1D1D")
    zinc_dark = colors.HexColor("#18181B")
    zinc_light = colors.HexColor("#FAFAFA")
    zinc_gray = colors.HexColor("#71717A")
    emerald = colors.HexColor("#059669")
    amber = colors.HexColor("#D97706")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.white,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#FECACA")
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=crimson,
        spaceBefore=12,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=zinc_dark,
        spaceBefore=8,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#27272A"),
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#3F3F46"),
        leftIndent=12,
        spaceAfter=3
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#1E293B")
    )

    meta_style = ParagraphStyle(
        'MetaText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#52525B")
    )

    story = []

    # -------------------------------------------------------------
    # PAGE 1: COVER & EXECUTIVE OVERVIEW
    # -------------------------------------------------------------
    header_data = [
        [
            Paragraph("<b>PHOENIX FITNESS CENTRE</b><br/><font size=9>Modern Gym & Personal Fitness Academy — Production System Specification</font>", title_style),
            Paragraph("<b>System Status:</b> <font color='#10B981'>OPERATIONAL (200 OK)</font><br/><b>Live Deployment:</b> frontend-jet-psi-40.vercel.app<br/><b>Gym Email:</b> phoenixgym.vkp@gmail.com<br/><b>Desk & Support:</b> +91 8015552425", subtitle_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[310, 212])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), crimson),
        ('PADDING', (0, 0), (-1, -1), 12),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))

    # Executive Overview
    story.append(Paragraph("1. Executive Summary & Operational Status", h1_style))
    story.append(Paragraph(
        "This document provides the definitive architectural specification, operational walkthrough, and visual flowcharts for the <b>Phoenix Fitness Centre</b> web platform. The system operates as a unified management platform designed for gym owners and desk operators to handle member enrollments, subscription lifecycle management, automated progressive expiry warnings, 1-click renewals, and real-time revenue telemetry.",
        body_style
    ))

    # Status Overview Grid Table
    status_grid = [
        [
            Paragraph("<b>Component / Area</b>", callout_style),
            Paragraph("<b>Operational State</b>", callout_style),
            Paragraph("<b>Target Endpoint / Details</b>", callout_style)
        ],
        [
            Paragraph("Vercel Web App", body_style),
            Paragraph("<font color='#059669'><b>Active / Production</b></font>", body_style),
            Paragraph("https://frontend-jet-psi-40.vercel.app", body_style)
        ],
        [
            Paragraph("Official Contact Line", body_style),
            Paragraph("<font color='#059669'><b>Configured & Active</b></font>", body_style),
            Paragraph("+91 8015552425 (WhatsApp & Desk Support)", body_style)
        ],
        [
            Paragraph("Official Gym Email", body_style),
            Paragraph("<font color='#059669'><b>Configured & Active</b></font>", body_style),
            Paragraph("phoenixgym.vkp@gmail.com (SMTP Reminders)", body_style)
        ],
        [
            Paragraph("UPI Payment Line", body_style),
            Paragraph("<font color='#059669'><b>Active Instant Mode</b></font>", body_style),
            Paragraph("phoenixgym.vkp@oksbi (+91 8015552425)", body_style)
        ],
        [
            Paragraph("Cloud Synchronization", body_style),
            Paragraph("<font color='#059669'><b>Adaptive Smart Sync</b></font>", body_style),
            Paragraph("IndexedDB Persistence & Google Cloud Backup", body_style)
        ],
        [
            Paragraph("Production Release", body_style),
            Paragraph("<font color='#059669'><b>Synchronized & Edge Live</b></font>", body_style),
            Paragraph("Production Release (Vercel Edge Global CDN)", body_style)
        ]
    ]
    t_status = Table(status_grid, colWidths=[130, 120, 272])
    t_status.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F4F4F5")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E4E4E7")),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t_status)
    story.append(Spacer(1, 10))

    # Core Features Summary
    story.append(Paragraph("2. Primary Website Functionality & Core Modules", h1_style))
    story.append(Paragraph("<b>1. Dashboard Telemetry Console:</b> Displays real-time metrics including Active Members, Expiring Soon, Payments Pending, and Today's Renewals. Features quick actions, live reminder dispatch monitor, and member growth analytics.", bullet_style))
    story.append(Paragraph("<b>2. Gym Members Directory:</b> High-density member database with full-text search (ID, name, phone, village) and categorized filtering (Active, Expired, Expiring in 15 days, Today's Renewals, Pending).", bullet_style))
    story.append(Paragraph("<b>3. Member Enrollment & Auto-ID:</b> Form with strict 10-digit phone validation, automated unique ID assignment (`PXM-XXXX`), BMI calculation, and instant printable vector receipt generation.", bullet_style))
    story.append(Paragraph("<b>4. Real-time Revenue & Churn Reports:</b> Daily, Weekly, and Monthly financial aggregation from live transactions, calculating Net Growth, Churn Rate %, Retention Rate %, and Unit ARPU with 1-click export to PDF and Excel/CSV.", bullet_style))
    story.append(Paragraph("<b>5. Dynamic UPI QR & Payment Reconciliation:</b> Generates unique UPI intent strings and dynamic QR codes pre-filled with exact fee amount and unique transaction ID (`tr=TXN_...`), with required UTR reference verification.", bullet_style))
    story.append(Paragraph("<b>6. IndexedDB & Database-Grade Soft Deletes:</b> Replaces fragile browser cache limits with asynchronous IndexedDB persistence and `isDeleted: true` soft-deletion pattern, preventing deleted members from resurrecting.", bullet_style))
    story.append(Paragraph("<b>7. Role-Based Access Control (RBAC):</b> Dedicated role boundaries for Administrator (full financial exports & deletion), Desk Staff (operational enrollment, renewals, reminders), and Trainers (view-only).", bullet_style))
    story.append(Paragraph("<b>8. Progressive Expiry Engine:</b> Automatically computes remaining validity and advances alert urgency: 3 Days Left → 2 Days Left → Expires Tomorrow (1 Day Left!) → Expires TODAY! → Expired.", bullet_style))
    story.append(Paragraph("<b>9. Seamless 1-Click Renewal Workflow:</b> Accessible from directory, notification feed, or dashboard. Dynamically computes new expiry dates, restores active status, logs payment records, and clears old alerts.", bullet_style))
    story.append(Paragraph("<b>10. Multi-Channel Notifications:</b> Direct pre-filled Web WhatsApp deep-linking and automated Gmail delivery with official PDF invoice attachments.", bullet_style))

    story.append(PageBreak())

    # -------------------------------------------------------------
    # PAGE 2: FLOWCHART 1 & LIFECYCLE WALKTHROUGH
    # -------------------------------------------------------------
    story.append(Paragraph("3. Member Lifecycle, Expiration Progression & Renewal Flow", h1_style))
    story.append(Paragraph(
        "The following diagram illustrates how the system manages each gym member from initial enrollment through the daily expiration calculation, progressive alerts, and the automatic renewal workflow.",
        body_style
    ))

    # Embed Diagram 1
    rl_img1 = RLImage(d1_path, width=522, height=342)
    story.append(rl_img1)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Detailed Workflow Breakdown:</b>", h2_style))
    story.append(Paragraph("<b>• Step 1 — Enrollment:</b> When a new member registers, their start date and chosen plan calculate their initial `endDate`. The member receives an Active status and Paid status, generating a vector PDF receipt and welcome email modal.", bullet_style))
    story.append(Paragraph("<b>• Step 2 — Daily Expiration Calculation:</b> The system runs `diffDays = (endDate - today)`. Members with more than 3 days left remain in standard Active status with green badge indicators.", bullet_style))
    story.append(Paragraph("<b>• Step 3 — Progressive Urgency Escalation:</b><br/>"
                           "&nbsp;&nbsp;&nbsp;&nbsp;• <b>3 Days Left:</b> System displays <code>⏰ Expires in 3 Days</code> with friendly early-bird renewal notice.<br/>"
                           "&nbsp;&nbsp;&nbsp;&nbsp;• <b>2 Days Left:</b> Automatically advances to <code>⏳ Expires in 2 Days</code> with countdown urgency.<br/>"
                           "&nbsp;&nbsp;&nbsp;&nbsp;• <b>1 Day Left:</b> Escalates to <code>🚨 Expires Tomorrow (1 Day Left!)</code> with rose critical alert.<br/>"
                           "&nbsp;&nbsp;&nbsp;&nbsp;• <b>0 Days Left:</b> Displays <code>⚠️ Membership Expires TODAY!</code> alerting front desk for immediate payment.<br/>"
                           "&nbsp;&nbsp;&nbsp;&nbsp;• <b>Past Expiry (endDate &lt; today):</b> Automatically marked as <b>Expired</b> with a red shield badge, moving to the Expired Members filter.", bullet_style))
    story.append(Paragraph("<b>• Step 4 — Instant Renewal:</b> Clicking 'Renew' opens <code>RenewModal.jsx</code>. If the member was expired, the new plan starts from TODAY. If active, it seamlessly extends from their existing end date. On confirmation, active status is restored, payments are logged, and Today's Renewals increment automatically.", bullet_style))

    story.append(PageBreak())

    # -------------------------------------------------------------
    # PAGE 3: FLOWCHART 2 & NOTIFICATION ENGINE
    # -------------------------------------------------------------
    story.append(Paragraph("4. Automated Multi-Channel Reminder & Dispatch Pipeline", h1_style))
    story.append(Paragraph(
        "Phoenix Gym employs a dual-channel notification pipeline combining direct Web WhatsApp messaging and Gmail SMTP delivery with automated vector PDF receipts.",
        body_style
    ))

    # Embed Diagram 2
    rl_img2 = RLImage(d2_path, width=522, height=310)
    story.append(rl_img2)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Reminder Engine Specifications:</b>", h2_style))
    story.append(Paragraph("<b>• Duplicate Prevention:</b> Before any reminder is sent, the system checks the dispatch ledger for today. If an alert has already been sent to this member via this channel today, it is automatically skipped to prevent spam.", bullet_style))
    story.append(Paragraph("<b>• Web WhatsApp Integration:</b> Constructs an encoded URL: <code>https://web.whatsapp.com/send?phone=91[PHONE]&amp;text=[ENCODED_MESSAGE]</code>. Clicking the button opens WhatsApp Web with the customized message and official UPI ID (<code>phoenixgym.vkp@oksbi</code>) ready to send with one click.", bullet_style))
    story.append(Paragraph("<b>• Gmail SMTP Transporter:</b> Sent through <code>phoenixgym.vkp@gmail.com</code> using secure Google App Passwords. Outgoing emails include an official gym header, membership details, and a dynamic vector PDF renewal invoice.", bullet_style))
    story.append(Paragraph("<b>• Notification Center Management:</b> Operators can review active notifications, send 1-click reminders, renew memberships directly, clear individual alerts, or use 'Clear Notifications' and 'Restore Cleared' controls.", bullet_style))

    story.append(PageBreak())

    # -------------------------------------------------------------
    # PAGE 4: FLOWCHART 3, ARCHITECTURE & ADMIN GUIDE
    # -------------------------------------------------------------
    story.append(Paragraph("5. System Architecture, Data Synchronization & Operations", h1_style))
    story.append(Paragraph(
        "The architecture is designed for zero-downtime high reliability, allowing the gym to operate on laptops, tablets, or phones simultaneously without data loss.",
        body_style
    ))

    # Embed Diagram 3
    rl_img3 = RLImage(d3_path, width=522, height=310)
    story.append(rl_img3)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Data Synchronization & Architecture Details:</b>", h2_style))
    story.append(Paragraph("<b>• Dual-Layer Storage:</b> All records are cached locally in <code>localStorage</code> for zero-latency UI rendering and offline safety, then synchronized to Google Sheets through Google Apps Script webhooks (<code>Code.gs</code>).", bullet_style))
    story.append(Paragraph("<b>• Auto-Poll & Focus Sync:</b> Whenever the desk operator switches between windows or tabs, a focus event re-syncs state. In the background, a 6-second polling loop checks for external updates.", bullet_style))
    story.append(Paragraph("<b>• Deletion Safety:</b> Deleted member IDs are logged in a deleted key array (<code>phoenix_gym_deleted_member_ids</code>), preventing deleted members from accidentally reappearing during background syncs.", bullet_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Front-Desk Quick Reference Guide:</b>", h2_style))

    guide_data = [
        [Paragraph("<b>Task</b>", callout_style), Paragraph("<b>How To Perform It In The App</b>", callout_style)],
        [Paragraph("Add New Member", body_style), Paragraph("Click <b>Add Member</b> in sidebar or dashboard. Enter details. Receipt PDF opens immediately upon saving.", body_style)],
        [Paragraph("Renew a Member", body_style), Paragraph("Click <b>Renew</b> button on any member in Members List or Notifications. Pick plan duration & confirm. Expiry date and status update instantly.", body_style)],
        [Paragraph("Send WhatsApp Reminder", body_style), Paragraph("Go to <b>Notifications</b>. Click <b>Web WhatsApp</b> on any alert card. WhatsApp Web opens with pre-typed message.", body_style)],
        [Paragraph("Send Email Reminder", body_style), Paragraph("In <b>Notifications</b>, click <b>Reminder</b> button. Preview email & invoice PDF, then click Send.", body_style)],
        [Paragraph("Filter Expired Members", body_style), Paragraph("In <b>Members List</b>, open the dropdown and select <b>Expired Members</b>.", body_style)]
    ]
    t_guide = Table(guide_data, colWidths=[150, 372])
    t_guide.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F4F4F5")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E4E4E7")),
        ('PADDING', (0, 0), (-1, -1), 4.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_guide)

    # Build the PDF
    doc.build(story)
    print(f"PDF successfully built at: {OUTPUT_PDF_PATH}")

    # Copy to artifacts directory
    import shutil
    shutil.copyfile(OUTPUT_PDF_PATH, ARTIFACT_PDF_PATH)
    print(f"Copied PDF to artifact path: {ARTIFACT_PDF_PATH}")

if __name__ == "__main__":
    generate_pdf()
