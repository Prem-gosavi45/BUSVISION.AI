from pathlib import Path

from backend.supabase_client import supabase


BUCKET_NAME = "pothole-images"


def upload_image(file_path: str, storage_path: str):
    file = Path(file_path)

    if not file.exists():
        raise FileNotFoundError(f"Image not found: {file_path}")

    with open(file, "rb") as image_file:
        response = supabase.storage.from_(BUCKET_NAME).upload(
            path=storage_path,
            file=image_file,
            file_options={
                "content-type": "image/jpeg",
                "upsert": "true",
            },
        )

    return response


def get_public_url(storage_path: str):
    return supabase.storage.from_(BUCKET_NAME).get_public_url(
        storage_path
    )