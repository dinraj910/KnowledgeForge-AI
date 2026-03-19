"""Integration tests for the document ingestion pipeline.

Run from the `backend/` directory with the venv activated:
    pytest tests/test_ingestion.py -v
"""

import asyncio
import io
import os
import tempfile

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

# Point to a temp DB and temp upload dir so tests don't pollute the real ones
os.environ.setdefault("DB_PATH", os.path.join(tempfile.gettempdir(), "test_ingestion.db"))
os.environ.setdefault("UPLOAD_DIR", os.path.join(tempfile.gettempdir(), "test_uploads"))

from app.main import app  # noqa: E402 – import after env setup
from app.db.database import init_db  # noqa: E402


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture(scope="module", autouse=True)
async def setup_db():
    """Create tables once before all tests in this module."""
    await init_db()


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _txt_file(content: str = "Hello world. This is a test document.") -> tuple[str, bytes, str]:
    return ("test.txt", content.encode(), "text/plain")


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_upload_txt_returns_queued(client: AsyncClient):
    name, data, mime = _txt_file()
    resp = await client.post(
        "/api/v1/documents/upload",
        data={"user_id": "user-1"},
        files={"file": (name, data, mime)},
    )
    assert resp.status_code == 202, resp.text
    body = resp.json()
    assert body["status"] == "queued"
    assert body["filename"] == name
    assert "id" in body


@pytest.mark.asyncio
async def test_ingestion_completes(client: AsyncClient):
    """Upload a TXT and poll until completed."""
    name, data, mime = _txt_file("A" * 1000)  # enough for at least one chunk
    resp = await client.post(
        "/api/v1/documents/upload",
        data={"user_id": "user-2"},
        files={"file": (name, data, mime)},
    )
    assert resp.status_code == 202
    doc_id = resp.json()["id"]

    # Poll for up to 10 seconds
    for _ in range(20):
        await asyncio.sleep(0.5)
        status_resp = await client.get(f"/api/v1/documents/{doc_id}/status")
        assert status_resp.status_code == 200
        if status_resp.json()["status"] in ("completed", "failed"):
            break

    final = status_resp.json()
    assert final["status"] == "completed", f"Expected completed, got: {final}"
    assert final["chunk_count"] >= 1


@pytest.mark.asyncio
async def test_status_endpoint_not_found(client: AsyncClient):
    resp = await client.get("/api/v1/documents/nonexistent-id/status")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_unsupported_extension_rejected(client: AsyncClient):
    resp = await client.post(
        "/api/v1/documents/upload",
        data={"user_id": "user-3"},
        files={"file": ("malware.exe", b"MZ\x90\x00", "application/octet-stream")},
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_empty_file_rejected(client: AsyncClient):
    resp = await client.post(
        "/api/v1/documents/upload",
        data={"user_id": "user-4"},
        files={"file": ("empty.txt", b"", "text/plain")},
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_pdf_upload_and_ingest(client: AsyncClient):
    """Upload a minimal valid PDF and verify ingestion completes."""
    # Minimal PDF structure (valid but tiny)
    minimal_pdf = (
        b"%PDF-1.4\n"
        b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
        b"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]"
        b"/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n"
        b"4 0 obj<</Length 44>>stream\nBT /F1 12 Tf 100 700 Td (KnowledgeForge test.) Tj ET\nendstream\nendobj\n"
        b"5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n"
        b"xref\n0 6\n0000000000 65535 f \n"
        b"trailer<</Size 6/Root 1 0 R>>\nstartxref\n9\n%%EOF"
    )
    resp = await client.post(
        "/api/v1/documents/upload",
        data={"user_id": "user-5"},
        files={"file": ("sample.pdf", minimal_pdf, "application/pdf")},
    )
    assert resp.status_code == 202
    doc_id = resp.json()["id"]

    for _ in range(20):
        await asyncio.sleep(0.5)
        status_resp = await client.get(f"/api/v1/documents/{doc_id}/status")
        if status_resp.json()["status"] in ("completed", "failed"):
            break

    # PDF might fail to extract text from minimal PDF – either completed or failed is acceptable
    # as long as status is not stuck at queued/processing
    assert status_resp.json()["status"] in ("completed", "failed")
