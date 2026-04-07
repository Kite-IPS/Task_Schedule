from django.core.management.base import BaseCommand
from task.utils import send_daily_reminders
from django.utils import timezone

class Command(BaseCommand):
    help = 'Send daily task reminders to assignees (scheduled for morning)'

    def handle(self, *args, **options):
        self.stdout.write(f"Starting daily reminder task at {timezone.now()}")
        count = send_daily_reminders()
        self.stdout.write(self.style.SUCCESS(f"Successfully sent {count} daily reminder emails"))
