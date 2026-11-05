from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from fastapi import APIRouter, status
from app.schemas.common import APIResponse
from app.services.rag_service import ask_rag_assistant

router = APIRouter()


class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message text")


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="User's query")
    history: Optional[List[ChatMessage]] = Field(default=[], description="Recent conversation turns")


class ChatResponseData(BaseModel):
    reply: str
    is_fallback: bool
    source: str = "ragbased.pdf"


@router.post("", response_model=APIResponse[ChatResponseData], status_code=status.HTTP_200_OK)
@router.post("/ask", response_model=APIResponse[ChatResponseData], status_code=status.HTTP_200_OK)
def chat_with_handbook(payload: ChatRequest):
    """
    RAG Agent powered by LangChain and Google Gemini.
    Answers queries strictly using the HomeServe Company Handbook (ragbased.pdf).
    Provides static fallback answer for any questions outside the handbook scope.
    """
    history_dicts = [{"role": m.role, "content": m.content} for m in payload.history] if payload.history else None
    result = ask_rag_assistant(question=payload.message, history=history_dicts)

    return APIResponse(
        message="Response generated successfully from company policies handbook",
        data=ChatResponseData(
            reply=result["reply"],
            is_fallback=result["is_fallback"],
            source=result["source"]
        )
    )

