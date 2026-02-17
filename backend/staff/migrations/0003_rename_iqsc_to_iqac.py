from django.db import migrations, models


def rename_iqsc_to_iqac(apps, schema_editor):
    """Update any existing users with department='IQSC' to 'IQAC'"""
    User = apps.get_model('staff', 'User')
    User.objects.filter(department='IQSC').update(department='IQAC')


def rename_iqac_to_iqsc(apps, schema_editor):
    """Reverse: Update any existing users with department='IQAC' back to 'IQSC'"""
    User = apps.get_model('staff', 'User')
    User.objects.filter(department='IQAC').update(department='IQSC')


class Migration(migrations.Migration):

    dependencies = [
        ('staff', '0002_alter_user_department'),
    ]

    operations = [
        # First, update existing data
        migrations.RunPython(rename_iqsc_to_iqac, rename_iqac_to_iqsc),
        # Then, update the field choices
        migrations.AlterField(
            model_name='user',
            name='department',
            field=models.CharField(
                blank=True,
                choices=[
                    ('CSE', 'Computer Science'),
                    ('ECE', 'Electronics'),
                    ('MECH', 'Mechanical'),
                    ('IT', 'Information Technology'),
                    ('CSBS', 'Computer Science & Business Systems'),
                    ('AIML', 'Artifical Intelligence and Machine Learning'),
                    ('AIDS', 'Artifical Intelligence and Data Science'),
                    ('CYS', 'CyberSecurity'),
                    ('OFFICE', 'Kite Office'),
                    ('MBA', 'Master of Business Administration'),
                    ('INNOVATION TEAM', 'Innovation Team'),
                    ('OTHERS', 'Non-Teaching Staffs'),
                    ('PLACEMENT', 'Placement Department'),
                    ('RA', 'Robotics & Automation'),
                    ('S&H', 'Science & Humanities'),
                    ('IQAC', 'iqac'),
                ],
                max_length=50,
                null=True,
            ),
        ),
    ]
