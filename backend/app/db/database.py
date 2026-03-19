"""Async SQLite database helper for ingestion job and chunk tracking."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import aiosqlite

from app.core.config import get_settings

_settings = get_settings()
DB_PATH = _settings.db_path


CREATE_DOCUMENTS_TABLE = """
CREATE TABLE IF NOT EXISTS documents (
    id           TEXT PRIMARY KEY,
    user_id      TEXT NOT NULL,
    filename     TEXT NOT NULL,
    file_path    TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'queued',
    error_message TEXT,
    chunk_count  INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL
);
"""

CREATE_CHUNKS_TABLE = """
CREATE TABLE IF NOT EXISTS chunks (
    id           TEXT PRIMARY KEY,
    document_id  TEXT NOT NULL REFERENCES documents(id),
    user_id      TEXT NOT NULL,
    content      TEXT NOT NULL,
    chunk_index  INTEGER NOT NULL,
    char_start   INTEGER NOT NULL,
    char_end     INTEGER NOT NULL,
    created_at   TEXT NOT NULL
);
"""


async def init_db() -> None:
    """Create tables if they don't already exist."""
    async with aiosqlite.connect(DB_PATH) as conn:
        await conn.execute(CREATE_DOCUMENTS_TABLE)
        await conn.execute(CREATE_CHUNKS_TABLE)
        await conn.commit()


@asynccontextmanager
async def get_db() -> AsyncGenerator[aiosqlite.Connection, None]:
    """Async context manager that yields an open, row-factory-configured connection."""
    async with aiosqlite.connect(DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        yield conn
