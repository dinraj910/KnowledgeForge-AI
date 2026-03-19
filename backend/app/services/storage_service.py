"""Storage service – persists uploaded file bytes to local disk."""

import os

import aiofiles

from app.core.config import get_settings

_settings = get_settings()


async def save_upload(user_id: str, doc_id: str, filename: str, data: bytes) -> str:
    """
    Save *data* to UPLOAD_DIR/{user_id}/{doc_id}/{filename}.

    Returns the absolute file path.
    """
    target_dir = os.path.join(_settings.upload_dir, user_id, doc_id)
    os.makedirs(target_dir, exist_ok=True)

    file_path = os.path.join(target_dir, filename)
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(data)

    return file_path
