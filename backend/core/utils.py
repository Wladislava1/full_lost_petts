from sqlalchemy.orm import Session
from sqlalchemy import text

def check_db_connection(db: Session):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}