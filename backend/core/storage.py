import uuid
import os
import shutil
from fastapi import HTTPException

class LocalStorage:
    def __init__(self):
        self.upload_dir = "media"
        self.base_url = "/media"

    async def upload_file(self, file, user_id: int) -> str:
        try:
            user_dir = os.path.join(self.upload_dir, str(user_id))
            os.makedirs(user_dir, exist_ok=True)
            
            file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
            filename = f"{uuid.uuid4()}.{file_extension}"
            filepath = os.path.join(user_dir, filename)
            
            with open(filepath, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            return f"{self.base_url}/{user_id}/{filename}"
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")

    async def delete_file(self, file_url: str) -> bool:
        try:
            if not file_url or not file_url.startswith(self.base_url):
                return False
                
            relative_path = file_url.replace(f"{self.base_url}/", "")
            filepath = os.path.join(self.upload_dir, relative_path)
            
            if os.path.exists(filepath):
                os.remove(filepath)
                return True
            return False
            
        except Exception:
            return False

storage = LocalStorage()