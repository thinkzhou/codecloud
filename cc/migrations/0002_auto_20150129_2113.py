# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cc', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='problem',
            name='problem_name',
            field=models.TextField(max_length=1000, null=True, blank=True),
            preserve_default=True,
        ),
    ]
