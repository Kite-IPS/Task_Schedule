import time
import subprocess
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables (to get REMINDER_TIME)
load_dotenv()

# Default reminder time from .env if specified, otherwise 08:00
REMINDER_TIME = os.getenv('REMINDER_TIME', '08:00')

print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Daily Scheduler Started.")
print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Monitoring for time: {REMINDER_TIME}")

def run_task():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Triggering send_daily_8am_reminders management command...")
    try:
        # Run the management command
        # subprocess.run is used here to ensure we run it exactly as we would manually
        # Note: We use send_daily_8am_reminders as per the latest file name choice
        result = subprocess.run(["python", "manage.py", "send_daily_8am_reminders"], capture_output=True, text=True)
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Output:\n{result.stdout}")
        if result.stderr:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Errors:\n{result.stderr}")
    except Exception as e:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Critical Error: {str(e)}")

while True:
    try:
        # Check current time
        current_time = datetime.now().strftime("%H:%M")
        
        if current_time == REMINDER_TIME:
            run_task()
            # Wait for 61 seconds so we don't trigger multiple times in the same minute
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Task completed. Waiting for next window...")
            time.sleep(65)
            
        # Check every 10 seconds to be precise but not overload CPU
        time.sleep(10)
    except KeyboardInterrupt:
        print("Scheduler stopped by user.")
        break
    except Exception as e:
        print(f"Unexpected error in scheduler loop: {e}")
        time.sleep(60) # Wait a minute before retrying
