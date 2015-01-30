# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cc', '0002_auto_20150129_2113'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='problem',
            name='probelm_id',
        ),
    ]
