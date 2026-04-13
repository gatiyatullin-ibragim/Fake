from django.db import models
from django.contrib.auth.models import User
from products.models import Product


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending',   'В обработке'),
        ('completed', 'Завершён'),
        ('cancelled', 'Отменён'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    created_at = models.DateTimeField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} — {self.user.username}"

    @property
    def total_price(self):
        return sum(item.get_cost() for item in self.items.all())


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # цена на момент покупки
    quantity = models.PositiveIntegerField(default=1)
    product_name = models.CharField(max_length=200, blank=True)   # сохраняем имя на случай удаления товара

    def __str__(self):
        return f"{self.quantity}x {self.product_name} (Order #{self.order.id})"

    def get_cost(self):
        return self.price * self.quantity

    def save(self, *args, **kwargs):
        # Автоматически сохраняем имя товара
        if self.product and not self.product_name:
            self.product_name = self.product.name
        super().save(*args, **kwargs)