import os
from pathlib import Path


def ensure_dirs(target_dir: Path):
    target_dir.mkdir(parents=True, exist_ok=True)


def create_synthetic_inspection_pdf(output_path: Path):
    """Creates synthetic inspection report using fitz if available, or structured text fallback."""
    try:
        import fitz
        from PIL import Image, ImageDraw

        doc = fitz.open()
        page1 = doc.new_page(width=595, height=842)
        page1.insert_text((50, 60), "MANGALORE REFINERY AND PETROCHEMICALS LIMITED", fontsize=14, fontname="helv", color=(0.1, 0.2, 0.5))
        page1.insert_text((50, 85), "ANNUAL STATUTORY PLANT INSPECTION REPORT", fontsize=12, fontname="helv")
        page1.insert_text((50, 115), "Unit: Crude Distillation Unit (CDU-5)", fontsize=10)
        page1.insert_text((50, 130), "Inspection Scope: Column Feed Piping & Pressure Relief Loops", fontsize=10)
        page1.insert_text((50, 145), "Date of Inspection: 15-January-2026", fontsize=10)
        page1.insert_text((50, 160), "Lead Inspector: Senior Inspection Engineer (Badge #MRPL-8821)", fontsize=10)

        summary_text = """EXECUTIVE SUMMARY:
Routine non-destructive testing (NDT) and ultrasonic thickness gauging were executed across Crude Feed Piping Train P-102 and associated bypass manifolds.

CRITICAL FINDINGS:
1. Piping Section Line 04-CR-102 (Pipe P-102): Measured minimum wall thickness of 3.8 mm against nominal 5.0 mm. Baseline 3.5 years ago was 5.0 mm. Minimum retirement thickness threshold per design is 3.0 mm.
2. Isolation Valve V-14: Slight hydrocarbon weeping detected at packing gland seal.
3. Flange Connection F-08: Atmospheric surface corrosion; ultrasonic scan confirms no loss of flange face integrity.

RECOMMENDATION:
Submit technical approval note to Operations In-Charge for scheduled turnaround replacement package."""
        page1.insert_textbox(fitz.Rect(50, 190, 545, 450), summary_text, fontsize=9.5, fontname="helv")

        # Page 2: Visual Scanned Measurement Sheet
        img = Image.new('RGB', (1200, 1600), color=(250, 248, 240))
        draw = ImageDraw.Draw(img)
        draw.rectangle([(50, 50), (1150, 1550)], outline=(180, 180, 180), width=2)
        draw.text((80, 80), "MRPL MECHANICAL INTEGRITY & NDT FIELD MEASUREMENT LOG", fill=(20, 20, 20))
        draw.text((80, 130), "Tag: Line 04-CR-102 (Crude Feed to Column C-101)", fill=(40, 40, 40))
        draw.text((80, 170), "Ultrasonic Thickness Measurements (mm):", fill=(40, 40, 40))
        draw.text((100, 220), "• T-Point 01 (North Elbow): 4.1 mm", fill=(20, 20, 20))
        draw.text((100, 260), "• T-Point 02 (Intrados Throat): 3.8 mm  <-- MINIMUM OBSERVED", fill=(180, 20, 20))
        draw.text((100, 300), "• T-Point 03 (Straight Run): 4.6 mm", fill=(20, 20, 20))
        draw.text((100, 340), "• T-Point 04 (South Reducer): 4.4 mm", fill=(20, 20, 20))
        draw.text((80, 420), "Operating Pressure: 14.5 kg/cm2  |  Temperature: 285 deg C", fill=(40, 40, 40))
        draw.text((80, 470), "Field Inspector Signature: [Verified J. Rao, Level-II UT]", fill=(30, 30, 120))

        img_temp = output_path.parent / "temp_page2.png"
        img.save(str(img_temp))

        page2 = doc.new_page(width=595, height=842)
        page2.insert_image(fitz.Rect(0, 0, 595, 842), filename=str(img_temp))
        doc.save(str(output_path))
        doc.close()
        if img_temp.exists():
            img_temp.unlink()
    except ImportError:
        # Text/Markdown fallback if fitz not yet installed
        txt_path = output_path.with_suffix(".txt")
        txt_path.write_text("""MANGALORE REFINERY AND PETROCHEMICALS LIMITED
ANNUAL STATUTORY PLANT INSPECTION REPORT
Unit: Crude Distillation Unit (CDU-5)
Line 04-CR-102 (Pipe P-102): Measured minimum wall thickness 3.8 mm (Nominal: 5.0 mm).
Isolation Valve V-14: Packing gland seepage.
Flange F-08: Minor atmospheric pitting.""", encoding="utf-8")


def create_synthetic_sop_pdf(output_path: Path):
    try:
        import fitz
        doc = fitz.open()
        page = doc.new_page(width=595, height=842)
        page.insert_text((50, 60), "MANGALORE REFINERY AND PETROCHEMICALS LIMITED", fontsize=14, fontname="helv", color=(0.1, 0.2, 0.5))
        page.insert_text((50, 85), "STANDARD OPERATING PROCEDURE: SOP-OPS-014", fontsize=12, fontname="helv", color=(0.2, 0.2, 0.2))
        page.insert_text((50, 110), "Title: Post-Inspection Piping Integrity & Approval Protocol", fontsize=11, fontname="helv")

        sop_text = """1. PURPOSE & SCOPE
This standard defines statutory compliance actions following ultrasonic thickness inspection of hydrocarbon-bearing piping circuits in refinery process units.

2. CORROSION RATE CALCULATION FORMULA
The annual corrosion rate (CR) shall be computed as:
    Corrosion Rate (mm/year) = (Initial Nominal Thickness - Actual Measured Thickness) / Elapsed Service Years

3. REMAINING SERVICE LIFE CRITERIA
    Remaining Life (Years) = (Actual Measured Thickness - Minimum Retirement Thickness) / Corrosion Rate
Where:
- Nominal Crude Feed Piping Thickness = 5.0 mm
- Minimum Allowable Retirement Thickness = 3.0 mm

4. ACTION THRESHOLDS & ESCALATION
- If Remaining Life > 5.0 Years: Routine inspection cycle (36 months).
- If Remaining Life between 2.0 and 4.0 Years: Mandatory formal technical approval note, secondary ultrasonic scan within 90 days, and turnaround replacement package creation.
- If Remaining Life < 2.0 Years: Immediate de-rating or temporary composite wrap reinforcement.

5. SIGN-OFF AUTHORIZATION
Formal approval note must be generated and signed by Lead Inspection Engineer, Operations In-Charge, and Safety Department."""

        page.insert_textbox(fitz.Rect(50, 140, 545, 780), sop_text, fontsize=9.5, fontname="helv")
        doc.save(str(output_path))
        doc.close()
    except ImportError:
        txt_path = output_path.with_suffix(".txt")
        txt_path.write_text("""SOP-OPS-014: Post-Inspection Piping Integrity Protocol.
Formula: Corrosion Rate = (5.0 - Actual Thickness) / Elapsed Years.
Retirement Limit = 3.0 mm. Remaining life under 3 years triggers mandatory approval note.""", encoding="utf-8")


def create_synthetic_maintenance_pdf(output_path: Path):
    try:
        import fitz
        doc = fitz.open()
        page = doc.new_page(width=595, height=842)
        page.insert_text((50, 60), "MRPL ENGINEERING STANDARD: STD-MNT-007", fontsize=13, fontname="helv", color=(0.1, 0.2, 0.5))
        page.insert_text((50, 85), "Valve Packing Integrity & Flange Degradation Limits", fontsize=11, fontname="helv")

        std_text = """SECTION 6.1: VALVE GLAND PACKING INTEGRITY
Any hydrocarbon valve exhibiting gland weeping during on-stream inspection must be categorized as:
- Category A (>10 drops/min): Immediate online gland tightening or box injection.
- Category B (<10 drops/min): Gland repack scheduled for next unit maintenance turnaround.

SECTION 6.2: FLANGE INTEGRITY LIMITS
Atmospheric surface rust with pit depth under 0.5 mm is classified as Normal Oxidation. Application of anti-corrosive primer recommended during turnaround."""

        page.insert_textbox(fitz.Rect(50, 120, 545, 600), std_text, fontsize=9.5, fontname="helv")
        doc.save(str(output_path))
        doc.close()
    except ImportError:
        txt_path = output_path.with_suffix(".txt")
        txt_path.write_text("""STD-MNT-007: Valve Packing & Flange Degradation Limits.""", encoding="utf-8")


def create_synthetic_pump_excel(output_path: Path):
    rows = [
        ["Log_ID", "Pump_Tag", "Location_Unit", "Operating_Hours", "Failures_Count", "Failure_Mode", "Downtime_Hours", "Repair_Cost_INR"],
        ["LOG-101", "P-102A", "CDU-5", "720", "2", "Mechanical Seal Leak", "18.5", "45000"],
        ["LOG-102", "P-102B", "CDU-5", "680", "1", "Bearing High Vibration", "8.0", "22000"],
        ["LOG-103", "P-103A", "VDU-2", "710", "3", "Impeller Cavitation", "24.0", "78000"],
        ["LOG-104", "P-103B", "VDU-2", "690", "0", "None (Normal Run)", "0.0", "0"],
        ["LOG-105", "P-104A", "FCCU-1", "740", "2", "Coupling Misalignment", "12.0", "35000"],
        ["LOG-106", "P-104B", "FCCU-1", "730", "1", "Lube Oil Degradation", "6.5", "15000"],
        ["LOG-107", "P-105A", "HYDROCRACKER", "700", "4", "Shaft Runout & Seal", "32.0", "112000"],
        ["LOG-108", "P-105B", "HYDROCRACKER", "715", "1", "Motor Overcurrent", "5.0", "18000"]
    ]

    try:
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Alignment
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Pump_Failures_Log"
        for r in rows:
            ws.append([int(x) if x.isdigit() else float(x) if x.replace('.', '', 1).isdigit() else x for x in r])
        wb.save(str(output_path))
    except ImportError:
        # Write CSV fallback
        csv_path = output_path.with_suffix(".csv")
        csv_path.write_text("\n".join([",".join(r) for r in rows]), encoding="utf-8")


def create_synthetic_pid_image(output_path: Path):
    try:
        from PIL import Image, ImageDraw
        img = Image.new('RGB', (1400, 900), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)
        draw.rectangle([(20, 20), (1380, 880)], outline=(30, 40, 60), width=3)
        draw.text((50, 40), "MRPL CRUDE DISTILLATION UNIT (CDU-5) — P&ID SCHEMATIC (TRAIN-102)", fill=(15, 23, 42))
        draw.line([(100, 450), (1250, 450)], fill=(30, 58, 138), width=6)
        draw.text((450, 420), "Line 04-CR-102-A1A (4-inch CS) --->", fill=(30, 58, 138))
        draw.ellipse([(250, 380), (390, 520)], outline=(15, 23, 42), width=4)
        draw.polygon([(250, 450), (390, 380), (390, 520)], outline=(15, 23, 42), fill=(240, 244, 255))
        draw.text((290, 440), "P-102", fill=(15, 23, 42))
        draw.polygon([(600, 410), (660, 490), (660, 410), (600, 490)], outline=(180, 20, 20), fill=(255, 240, 240), width=3)
        draw.text((615, 505), "V-14 (Gate)", fill=(180, 20, 20))
        draw.polygon([(850, 410), (910, 490), (910, 410), (850, 490)], outline=(20, 120, 20), fill=(240, 255, 240), width=3)
        draw.text((860, 505), "CV-101 (FIC)", fill=(20, 120, 20))
        img.save(str(output_path))
    except ImportError:
        output_path.write_text("P&ID Schematic: Line 04-CR-102, Pump P-102, Valve V-14, Control Valve CV-101", encoding="utf-8")


def generate_all_demo_data():
    base_dir = Path(__file__).resolve().parent.parent
    demo_dir = base_dir / "demo" / "synthetic"
    data_docs = base_dir / "data" / "documents"
    data_kb = base_dir / "data" / "knowledge"

    ensure_dirs(demo_dir)
    ensure_dirs(data_docs)
    ensure_dirs(data_kb)

    print("Generating synthetic industrial documents for SIH26117 demos...")
    
    p1 = demo_dir / "Inspection_Report_001.pdf"
    create_synthetic_inspection_pdf(p1)
    print(f"[OK] Processed {p1.name}")

    p2 = demo_dir / "Operations_SOP_014.pdf"
    create_synthetic_sop_pdf(p2)
    print(f"[OK] Processed {p2.name}")

    p3 = demo_dir / "Maintenance_Standard_007.pdf"
    create_synthetic_maintenance_pdf(p3)
    print(f"[OK] Processed {p3.name}")

    p4 = demo_dir / "Pump_Failure_Data.xlsx"
    create_synthetic_pump_excel(p4)
    print(f"[OK] Processed {p4.name}")

    p5 = demo_dir / "P_and_ID_Example.png"
    create_synthetic_pid_image(p5)
    print(f"[OK] Processed {p5.name}")

    # Copy files into data directories for instant out-of-the-box readiness
    import shutil
    for src in [p1, p4, p5, demo_dir / "Inspection_Report_001.txt", demo_dir / "Pump_Failure_Data.csv"]:
        if src.exists():
            shutil.copy(src, data_docs / src.name)

    for src in [p2, p3, demo_dir / "Operations_SOP_014.txt", demo_dir / "Maintenance_Standard_007.txt"]:
        if src.exists():
            shutil.copy(src, data_kb / src.name)

    print("All synthetic industrial demo datasets successfully generated & staged!")


if __name__ == "__main__":
    generate_all_demo_data()
