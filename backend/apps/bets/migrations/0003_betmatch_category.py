from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bets', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='betmatch',
            name='category',
            field=models.CharField(
                choices=[
                    ('football', 'Football (Team 1 / Draw / Team 2)'),
                    ('other', 'Other (Yes / No)'),
                ],
                default='football',
                max_length=10,
            ),
        ),
    ]
