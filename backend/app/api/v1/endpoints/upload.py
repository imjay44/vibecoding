from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from app.dependencies import get_current_user
from app.models.entities import User
from app.schemas.common import APIResponse
from app.services.cloudinary_service import upload_file

router = APIRouter()


@router.post("", response_model=APIResponse[dict], status_code=status.HTTP_201_CREATED)
async def upload_document_or_image(
    file: UploadFile = File(...),
    folder: str = Form("homeserve/general"),
    current_user: User = Depends(get_current_user)
):
    """Uploads file through backend to Cloudinary CDN or persistent storage."""
    file_url = await upload_file(file, folder=folder)
    return APIResponse(
        message="File uploaded successfully",
        data={
            "url": file_url,
            "filename": file.filename
        }
    )
