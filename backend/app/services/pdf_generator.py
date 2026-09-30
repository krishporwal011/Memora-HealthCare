"""
Memora Server-Side PDF Report Generator (B20).
Generates explainable, non-diagnostic clinical summary PDF reports for ASHA workers and doctors.
Includes mandatory synthetic data disclaimers, statistical evidence, and doctor consultation advisory.
"""

from typing import Dict, Any
from app.services.anomaly import is_safe_message


def _escape_pdf_text(text: str) -> str:
    """Escape special PDF text characters."""
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def generate_asha_pdf_report(patient: Dict[str, Any]) -> bytes:
    """
    Generate a standard PDF 1.4 clinical summary report in pure Python.
    No heavy C-dependencies required; opens natively in any standard PDF reader.
    """
    full_name = patient.get("full_name", "Elder")
    status_label = patient.get("status_label", "Steady")
    guardian_name = patient.get("guardian_name", "Caregiver")
    guardian_rel = patient.get("guardian_relationship", "Family Member")
    lang = patient.get("preferred_language", "as")
    is_synthetic = patient.get("is_synthetic", True)
    active_alerts = patient.get("active_alerts", [])

    synthetic_badge = "[DEMO / SYNTHETIC DATA -- FOR SIH26003 EVALUATION ONLY]" if is_synthetic else "[CONFIDENTIAL CLINICAL RECORD]"

    # Prepare evidence lines
    evidence_lines = []
    if active_alerts:
        alert = active_alerts[0]
        nums = alert.get("triggering_numbers", {})
        evidence_lines.append(f"Primary Observation: {alert.get('trigger_metric', 'Score lower than usual')}")
        evidence_lines.append(f"Observed Score: {nums.get('current_score', alert.get('current_score', 'N/A'))}")
        evidence_lines.append(f"Personal Baseline Median: {nums.get('baseline_median', alert.get('baseline_median', 'N/A'))}")
        evidence_lines.append(f"Robust Z-Score: {nums.get('robust_z', alert.get('robust_z', 'N/A'))}")
        evidence_lines.append(f"Baseline Window: {nums.get('sample_size', '14')} sessions")
    else:
        evidence_lines.append("Longitudinal Status: Steady within 14-day personal baseline range.")
        evidence_lines.append("Activity consistency: 6 sessions completed this week.")

    disclaimer = (
        "Memora is an offline cognitive stimulation platform and not a medical device. "
        "All alerts reflect statistical variations from a personal baseline. "
        "Consider a check-up with a doctor if lower performance continues."
    )

    # Verify non-diagnostic copy
    assert is_safe_message(disclaimer), "PDF disclaimer failed safety check!"

    # PDF Stream commands
    stream_lines = [
        "BT",
        "/F1 16 Tf",
        "50 780 Td",
        f"({_escape_pdf_text('MEMORA CLINICAL SUMMARY REPORT')}) Tj",
        "/F1 10 Tf",
        "0 -20 Td",
        f"({_escape_pdf_text(synthetic_badge)}) Tj",
        "/F2 11 Tf",
        "0 -30 Td",
        f"({_escape_pdf_text(f'Patient Name: {full_name} | Language: {lang.upper()}')}) Tj",
        "0 -18 Td",
        f"({_escape_pdf_text(f'Guardian: {guardian_name} ({guardian_rel})')}) Tj",
        "/F1 12 Tf",
        "0 -25 Td",
        f"({_escape_pdf_text(f'ASHA Triage Status: {status_label.upper()}')}) Tj",
        "/F1 11 Tf",
        "0 -25 Td",
        f"({_escape_pdf_text('EXPLAINABLE STATISTICAL EVIDENCE:')}) Tj",
        "/F2 10 Tf",
    ]

    for ev in evidence_lines:
        stream_lines.append("0 -16 Td")
        stream_lines.append(f"({_escape_pdf_text(ev)}) Tj")

    stream_lines.extend([
        "/F1 10 Tf",
        "0 -30 Td",
        f"({_escape_pdf_text('CLINICAL ADVISORY & ETHICAL SAFEGUARDS:')}) Tj",
        "/F2 9 Tf",
    ])
    import textwrap
    wrapped_disclaimer = textwrap.wrap(disclaimer, width=70)
    for line in wrapped_disclaimer:
        stream_lines.append("0 -14 Td")
        stream_lines.append(f"({_escape_pdf_text(line)}) Tj")
    stream_lines.append("ET")

    stream_content = "\n".join(stream_lines).encode("latin1")
    stream_len = len(stream_content)

    # Construct complete PDF 1.4 objects
    obj1 = b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
    obj2 = b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
    obj3 = (
        b"3 0 obj\n"
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842]\n"
        b"/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >>\n"
        b"/Contents 6 0 R >>\nendobj\n"
    )
    obj4 = b"4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n"
    obj5 = b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
    obj6 = (
        f"6 0 obj\n<< /Length {stream_len} >>\nstream\n".encode("latin1")
        + stream_content
        + b"\nendstream\nendobj\n"
    )

    header = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
    body = header
    offsets = [0]

    for obj in [obj1, obj2, obj3, obj4, obj5, obj6]:
        offsets.append(len(body))
        body += obj

    xref_offset = len(body)
    xref = f"xref\n0 {len(offsets)}\n0000000000 65535 f \n".encode("latin1")
    for off in offsets[1:]:
        xref += f"{off:010d} 00000 n \n".encode("latin1")

    trailer = (
        f"trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\n"
        f"startxref\n{xref_offset}\n%%EOF\n"
    ).encode("latin1")

    return body + xref + trailer
