import os
import uuid
import shutil
from typing import Optional
from fastapi import UploadFile
import cloudinary
import cloudinary.uploader

from app.core.config import settings
from app.core.exceptions import BusinessLogicError

# Configure Cloudinary if non-placeholder credentials
IS_CLOUDINARY_CONFIGURED = (
    settings.CLOUDINARY_CLOUD_NAME != "cloudinary_placeholder"
    and settings.CLOUDINARY_API_KEY != "cloudinary_key_placeholder"
    and settings.CLOUDINARY_API_SECRET != "cloudinary_secret_placeholder"
)

if IS_CLOUDINARY_CONFIGURED:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )


def validate_file(file: UploadFile) -> None:
    """Validates file extension and size."""
    if not file.filename:
        raise BusinessLogicError("File name is missing")

    ext = file.filename.split(".")[-1].lower()
    if ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise BusinessLogicError(
            f"File format '.{ext}' is not supported. Allowed formats: {', '.join(settings.ALLOWED_IMAGE_EXTENSIONS)}"
        )


async def upload_file(file: UploadFile, folder: str = "homeserve/general") -> str:
    """Uploads file to Cloudinary, or securely to local storage if running in local sandbox."""
    validate_file(file)
    
    if IS_CLOUDINARY_CONFIGURED:
        try:
            content = await file.read()
            upload_result = cloudinary.uploader.upload(
                content,
                folder=folder,
                resource_type="auto"
            )
            return upload_result.get("secure_url", "")
        except Exception as e:
            raise BusinessLogicError(f"Cloudinary upload failed: {str(e)}")
        finally:
            await file.seek(0)
    else:
        # Local persistent fallback
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", folder.replace("/", "_"))
        os.makedirs(upload_dir, exist_ok=True)
        ext = file.filename.split(".")[-1].lower() if file.filename else "jpg"
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        target_path = os.path.join(upload_dir, unique_name)
        
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        await file.seek(0)
        # Return path served via static mount
        return f"/uploads/{folder.replace('/', '_')}/{unique_name}"
