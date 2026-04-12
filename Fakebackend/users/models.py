import json
from django.db import models
from django.contrib.auth.models import User


class UserPreference(models.Model):
    """
    Хранит счётчик тегов для каждого юзера.
    Пример tags_json: {"nike": 5, "white": 3, "sport": 10}

    Участник 2 дополнит эту модель своими эндпоинтами.
    Участник 3 использует increment_tags() из track_view.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preference')
    tags_json = models.TextField(default='{}')

    def get_tags(self) -> dict:
        try:
            return json.loads(self.tags_json)
        except Exception:
            return {}

    def increment_tags(self, tags: list):
        current = self.get_tags()
        for tag in tags:
            current[tag] = current.get(tag, 0) + 1
        self.tags_json = json.dumps(current)

    def reset_tags(self):
        self.tags_json = '{}'

    def __str__(self):
        return f"Preferences of {self.user.username}"