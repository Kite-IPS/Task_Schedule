# Generated manually
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('task', '0002_alter_task_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='cc_emails',
            field=models.JSONField(blank=True, default=list, help_text='List of extra emails to CC'),
        ),
    ]
