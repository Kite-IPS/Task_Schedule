from django.db import models

class Staff(models.Model):
    class Roles(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        STAFF = 'STAFF', 'Staff'
        HOD = 'HOD', 'Head of Department'
    
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=100)
    role = models.CharField(
        max_length=10,
        choices=Roles.choices,
        default=Roles.STAFF
    )
    password = models.CharField(max_length=128)


    def __str__(self):
        return f"{self.name} - {self.department}"

    class Meta:
        verbose_name = 'Staff'
        verbose_name_plural = 'Staff'
