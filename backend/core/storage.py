import os
import uuid
import io
import json
from fastapi import HTTPException, UploadFile
from minio import Minio
from minio.error import S3Error

class S3Storage:
    def __init__(self):
        self.minio_url = os.getenv("MINIO_URL", "localhost:9000")
        self.access_key = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
        self.secret_key = os.getenv("MINIO_SECRET_KEY", "minioadmin")
        self.bucket_name = "media"

        self.client = Minio(
            self.minio_url,
            access_key=self.access_key,
            secret_key=self.secret_key,
            secure=False
        )
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """Проверяет существование бакета и создает его публичным, если его нет"""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                policy = {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": {"AWS": "*"},
                            "Action": ["s3:GetObject"],
                            "Resource": [f"arn:aws:s3:::{self.bucket_name}/*"]
                        }
                    ]
                }
                self.client.set_bucket_policy(self.bucket_name, json.dumps(policy))
        except S3Error as err:
            print(f"Ошибка настройки MinIO: {err}")

    async def upload_file(self, file: UploadFile, user_id: int) -> str:
        try:
            file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
            filename = f"{user_id}/{uuid.uuid4()}.{file_extension}"
            
            file_content = await file.read()
            file_data = io.BytesIO(file_content)
            
            self.client.put_object(
                self.bucket_name,
                filename,
                file_data,
                length=len(file_content),
                content_type=file.content_type
            )
            
            return f"http://{self.minio_url}/{self.bucket_name}/{filename}"
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")

    async def delete_file(self, file_url: str) -> bool:
        try:
            prefix = f"http://{self.minio_url}/{self.bucket_name}/"
            if not file_url or not file_url.startswith(prefix):
                return False
                
            object_name = file_url.replace(prefix, "")
            self.client.remove_object(self.bucket_name, object_name)
            return True
            
        except Exception:
            return False

storage = S3Storage()