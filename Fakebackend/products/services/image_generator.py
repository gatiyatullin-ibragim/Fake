import requests
import time
from django.conf import settings


LEONARDO_BASE_URL = "https://cloud.leonardo.ai/api/rest/v1"


def _extract_image_url(payload: dict) -> str | None:
    generated = payload.get("generated_images") or payload.get("generatedImages") or []
    if generated and isinstance(generated, list):
        first = generated[0] or {}
        url = first.get("url") or first.get("imageUrl")
        if url:
            return url

    by_pk = payload.get("generations_by_pk") or payload.get("generation_by_pk") or {}
    if by_pk and isinstance(by_pk, dict):
        generated = by_pk.get("generated_images") or by_pk.get("generatedImages") or []
        if generated and isinstance(generated, list):
            first = generated[0] or {}
            url = first.get("url") or first.get("imageUrl")
            if url:
                return url

    return None


def generate_product_image(prompt: str) -> str:
    api_key = getattr(settings, "LEONARDO_API_KEY", "")
    if not api_key:
        raise Exception("Leonardo API key is missing. Set LEONARDO_API_KEY in environment.")

    create_response = requests.post(
        f"{LEONARDO_BASE_URL}/generations",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        json={
            "prompt": prompt,
            "modelId": settings.LEONARDO_MODEL_ID,
            "num_images": 1,
            "guidance_scale": 7.5,
            "num_inference_steps": 25,
            "width": 1024,
            "height": 1024,
            "presetStyle": "PHOTOGRAPHY"
        },
        timeout=60
    )

    if create_response.status_code != 200:
        raise Exception(f"Leonardo create generation error: {create_response.text}")

    create_payload = create_response.json()
    generation_job = create_payload.get("sdGenerationJob") or create_payload.get("generationJob") or {}
    generation_id = generation_job.get("generationId") or create_payload.get("generationId")
    if not generation_id:
        maybe_url = _extract_image_url(create_payload)
        if maybe_url:
            return maybe_url
        raise Exception(f"Leonardo response does not contain generation id: {create_payload}")

    for _ in range(20):
        detail_response = requests.get(
            f"{LEONARDO_BASE_URL}/generations/{generation_id}",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Accept": "application/json",
            },
            timeout=60,
        )

        if detail_response.status_code != 200:
            raise Exception(f"Leonardo get generation error: {detail_response.text}")

        detail_payload = detail_response.json()
        image_url = _extract_image_url(detail_payload)
        if image_url:
            return image_url

        time.sleep(2)

    raise Exception("Leonardo generation timed out before image URL became available.")