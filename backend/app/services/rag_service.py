import os
import pypdf
from typing import List, Dict, Optional, Any
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings

STATIC_FALLBACK_ANSWER = (
    "I am sorry, but I can only answer questions related to the HomeServe company policies, "
    "services, warranties, and operating procedures covered in our official handbook. "
    "For other queries or customized assistance, please reach out to HomeServe Support at "
    "support@homeserve.com or call our helpline."
)

_cached_handbook_text: Optional[str] = None
_cached_chain = None


def find_pdf_path() -> str:
    """Locates the company policies PDF across standard workspace paths."""
    candidates = [
        settings.RAG_PDF_PATH,
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "ragbased.pdf"),
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "ragbased.pdf"),
        os.path.join(os.getcwd(), "ragbased.pdf"),
        os.path.join(os.getcwd(), "backend", "ragbased.pdf"),
        os.path.join(os.getcwd(), "Home_Service_Company_Policies.pdf"),
    ]
    for path in candidates:
        if path and os.path.exists(path) and os.path.isfile(path):
            return os.path.abspath(path)
    return "ragbased.pdf"


def load_handbook_text() -> str:
    """Loads and extracts all page text from the company handbook PDF."""
    global _cached_handbook_text
    if _cached_handbook_text:
        return _cached_handbook_text

    pdf_path = find_pdf_path()
    if not os.path.exists(pdf_path):
        print(f"[WARN] PDF not found at {pdf_path}. Using empty handbook.")
        return ""

    try:
        reader = pypdf.PdfReader(pdf_path)
        pages_content = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                pages_content.append(f"--- PAGE {i+1} ---\n{text.strip()}")
        _cached_handbook_text = "\n\n".join(pages_content)
        print(f"[INFO] Loaded handbook ({len(reader.pages)} pages, {len(_cached_handbook_text)} chars) from {pdf_path}")
        return _cached_handbook_text
    except Exception as e:
        print(f"[ERROR] Failed to read PDF {pdf_path}: {e}")
        return ""


def get_rag_chain():
    """Initializes or returns cached LangChain RAG pipeline with Gemini."""
    global _cached_chain
    if _cached_chain is not None:
        return _cached_chain

    api_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
    if not api_key:
        print("[WARN] GEMINI_API_KEY is not set in environment or settings. Fallback responses will be used.")
    model_name = getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash")

    llm = ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=api_key,
        temperature=0.1
    )

    system_instruction = (
        "You are the official HomeServe AI Policy & Service Assistant for 'HomeServe Technologies'.\n"
        "Your role is to assist homeowners, customers, technicians, and partners by answering questions "
        "ACCURATELY, WARMLY, and CONCISELY based EXCLUSIVELY on the company handbook below.\n\n"
        "<OFFICIAL_COMPANY_HANDBOOK>\n"
        "{handbook_text}\n"
        "</OFFICIAL_COMPANY_HANDBOOK>\n\n"
        "STRICT COMPLIANCE RULES:\n"
        "1. Answer ONLY using the facts, policies, numbers, prices, timelines, warranties, and procedures "
        "explicitly stated in the handbook above.\n"
        "2. If the user asks ANY question that is NOT answered in or directly related to the handbook "
        "(for example: general knowledge, history, geography, math, coding, personal queries, weather, or "
        "unrelated products/services), you MUST respond ONLY with the following exact static response and NOTHING else:\n"
        f'"{STATIC_FALLBACK_ANSWER}"\n\n'
        "3. Do not make up facts, external policies, or speculate. Always stay within the scope of the handbook.\n"
        "4. Format your response cleanly with bullet points where appropriate for readability."
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_instruction),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{question}")
    ])

    _cached_chain = (prompt | llm)
    return _cached_chain


def ask_rag_assistant(question: str, history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
    """
    Executes RAG query using LangChain and Gemini against ragbased.pdf.
    Returns:
        {
            "reply": str,
            "is_fallback": bool,
            "source": str
        }
    """
    clean_question = question.strip()
    if not clean_question:
        return {
            "reply": "Please enter a question about our home services or company policies.",
            "is_fallback": False,
            "source": "ragbased.pdf"
        }

    # Format conversation history
    chat_history_messages = []
    if history:
        for item in history[-6:]: # Keep last 6 messages for context
            role = item.get("role", "")
            content = item.get("content", "")
            if role in ["user", "human"]:
                chat_history_messages.append(HumanMessage(content=content))
            elif role in ["assistant", "ai"]:
                chat_history_messages.append(AIMessage(content=content))

    handbook_text = load_handbook_text()
    if not handbook_text:
        return {
            "reply": STATIC_FALLBACK_ANSWER,
            "is_fallback": True,
            "source": "ragbased.pdf"
        }

    try:
        chain = get_rag_chain()
        response = chain.invoke({
            "handbook_text": handbook_text,
            "chat_history": chat_history_messages,
            "question": clean_question
        })

        reply_text = response.content.strip() if hasattr(response, "content") else str(response).strip()
        is_fallback = STATIC_FALLBACK_ANSWER.lower() in reply_text.lower() or reply_text == STATIC_FALLBACK_ANSWER

        return {
            "reply": reply_text,
            "is_fallback": is_fallback,
            "source": "ragbased.pdf"
        }

    except Exception as e:
        print(f"[ERROR] LangChain RAG invocation error: {e}")
        # Graceful fallback on API error
        return {
            "reply": STATIC_FALLBACK_ANSWER,
            "is_fallback": True,
            "source": "ragbased.pdf"
        }

