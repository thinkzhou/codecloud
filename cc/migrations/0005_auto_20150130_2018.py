# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cc', '0004_auto_20150130_1925'),
    ]

    operations = [
        migrations.RenameField(
            model_name='problem',
            old_name='problem_simple_input',
            new_name='problem_sample_input',
        ),
        migrations.RenameField(
            model_name='problem',
            old_name='problem_simple_output',
            new_name='problem_sample_output',
        ),
    ]
