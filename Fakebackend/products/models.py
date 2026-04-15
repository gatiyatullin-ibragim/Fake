from django.db import models


class Category(models.Model):
	name = models.CharField(max_length=120, unique=True)
	slug = models.SlugField(max_length=120, unique=True)

	class Meta:
		ordering = ['name']

	def __str__(self):
		return self.name


class Product(models.Model):
	name = models.CharField(max_length=200)
	description = models.TextField(blank=True)
	price = models.DecimalField(max_digits=10, decimal_places=2)
	image = models.URLField(blank=True)
	category = models.CharField(max_length=120, blank=True)
	tags = models.JSONField(default=list, blank=True)
	in_stock = models.BooleanField(default=True)
	brand = models.CharField(max_length=120, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['id']

	def __str__(self):
		return self.name
