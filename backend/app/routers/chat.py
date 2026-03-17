from pydantic import BaseModel
from fastapi import APIRouter

from app.services.rag_service import SourceChunk, rag_service

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    user_id: str
    question: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceChunk]


@router.post("/query", response_model=ChatResponse)
async def query_chat(payload: ChatRequest) -> ChatResponse:
    result = await rag_service.answer_question(
        question=payload.question,
        user_id=payload.user_id,
    )
    return ChatResponse(answer=result.answer, sources=result.sources)
