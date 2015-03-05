# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cc', '0006_profile'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='state',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
