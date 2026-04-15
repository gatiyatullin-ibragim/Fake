from django.contrib import admin
from django import forms

from .models import Category, Product


class ProductAdminForm(forms.ModelForm):
	category = forms.ChoiceField(choices=[], required=False)

	class Meta:
		model = Product
		fields = '__all__'

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		choices = [('', '---------')] + [
			(category.slug, f"{category.name} ({category.slug})")
			for category in Category.objects.all().order_by('name')
		]
		self.fields['category'].choices = choices


@admin.action(description='Sync categories from existing products')
def sync_categories_from_products(modeladmin, request, queryset):
	slugs = {slug for slug in Product.objects.values_list('category', flat=True) if slug}
	created = 0
	for slug in slugs:
		_, was_created = Category.objects.get_or_create(
			slug=slug,
			defaults={'name': slug.replace('-', ' ').title()},
		)
		if was_created:
			created += 1
	modeladmin.message_user(request, f"Category sync complete: created={created}, total={len(slugs)}")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
	form = ProductAdminForm
	list_display = ['id', 'name', 'brand', 'category', 'price', 'in_stock', 'created_at']
	list_filter = ['in_stock', 'brand', 'category']
	search_fields = ['name', 'description', 'brand', 'category']
	ordering = ['-created_at']

	def save_model(self, request, obj, form, change):
		if obj.category:
			Category.objects.get_or_create(
				slug=obj.category,
				defaults={'name': obj.category.replace('-', ' ').title()},
			)
		super().save_model(request, obj, form, change)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
	list_display = ['id', 'name', 'slug']
	search_fields = ['name', 'slug']
	actions = [sync_categories_from_products]
