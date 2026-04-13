import json
from django.db import models
from django.contrib.auth.models import User


class UserPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preference')
    counts = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Preferences for {self.user.username}'

    def reset(self):
        self.counts = {}
        self.save()

    def increment_tags(self, tags):
        if not isinstance(tags, list):
            return
        for tag in tags:
            if not isinstance(tag, str) or not tag:
                continue
            self.counts[tag] = self.counts.get(tag, 0) + 1
        self.save()
