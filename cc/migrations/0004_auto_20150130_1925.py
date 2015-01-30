# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cc', '0003_remove_problem_probelm_id'),
    ]

    operations = [
        migrations.RenameField(
            model_name='problem',
            old_name='probelm_simple_input',
            new_name='problem_simple_input',
        ),
        migrations.RenameField(
            model_name='problem',
            old_name='probelm_simple_output',
            new_name='problem_simple_output',
        ),
    ]
