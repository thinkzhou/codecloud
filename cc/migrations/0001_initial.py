# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Problem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('probelm_id', models.IntegerField(unique=True)),
                ('problem_name', models.TextField(max_length=65535, null=True, blank=True)),
                ('problem_description', models.TextField(max_length=65535, null=True, blank=True)),
                ('problem_input', models.TextField(max_length=65535, null=True, blank=True)),
                ('problem_output', models.TextField(max_length=65535, null=True, blank=True)),
                ('probelm_simple_input', models.TextField(max_length=65535, null=True, blank=True)),
                ('probelm_simple_output', models.TextField(max_length=65535, null=True, blank=True)),
                ('problem_hint', models.TextField(max_length=65535, null=True, blank=True)),
                ('problem_source', models.TextField(max_length=65535, null=True, blank=True)),
                ('probelm_time_limit', models.IntegerField(default=1000)),
                ('problem_memory_limit', models.IntegerField(default=10000)),
                ('problem_total_submissions', models.IntegerField(default=0)),
                ('problem_accepted', models.IntegerField(default=0)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
