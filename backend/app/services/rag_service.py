from dataclasses import dataclass


@dataclass
class SourceChunk:
    chunk_id: str
    document_name: str
    score: float
    content: str


@dataclass
class RAGAnswer:
    answer: str
    sources: list[SourceChunk]


class RAGService:
    """Starter service interface for RAG orchestration."""

    async def answer_question(self, question: str, user_id: str) -> RAGAnswer:
        demo_source = SourceChunk(
            chunk_id="demo-1",
            document_name="Getting-Started.txt",
            score=0.91,
            content="This is a placeholder source chunk. Replace with real retrieval.",
        )
        return RAGAnswer(
            answer=(
                f"Starter response for '{question}'. Wire this service to your embedding "
                "and vector retrieval pipeline to return grounded answers."
            ),
            sources=[demo_source],
        )


rag_service = RAGService()
