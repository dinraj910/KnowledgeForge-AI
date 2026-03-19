"""Text extraction service for PDF, DOCX, and TXT files."""

import re
from pathlib import Path


def _clean_text(raw: str) -> str:
    """Normalise whitespace and remove excessive blank lines."""
    # Collapse multiple spaces/tabs to a single space
    text = re.sub(r"[ \t]+", " ", raw)
    # Collapse 3+ consecutive newlines to 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_text(file_path: str) -> str:
    """
    Extract plain text from *file_path*.

    Supports: .pdf, .docx, .txt
    Raises ValueError for unsupported extensions.
    """
    path = Path(file_path)
    ext = path.suffix.lower()

    if ext == ".pdf":
        return _extract_pdf(file_path)
    elif ext == ".docx":
        return _extract_docx(file_path)
    elif ext == ".txt":
        return _extract_txt(file_path)
    else:
        raise ValueError(f"Unsupported file extension: {ext!r}")


def _extract_pdf(file_path: str) -> str:
    from pypdf import PdfReader

    reader = PdfReader(file_path)
    pages = []
    for page in reader.pages:
        text = page.extract_text() or ""
        pages.append(text)
    return _clean_text("\n".join(pages))


def _extract_docx(file_path: str) -> str:
    from docx import Document

    doc = Document(file_path)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return _clean_text("\n".join(paragraphs))


def _extract_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        return _clean_text(f.read())
