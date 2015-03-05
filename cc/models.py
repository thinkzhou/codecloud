from django.db import models
from django.contrib.auth.models import User
# Create your models here.


class Problem(models.Model):
    problem_name = models.TextField(max_length=1000, blank=True, null=True)
    problem_description = models.TextField(
        max_length=65535, blank=True, null=True)
    problem_input = models.TextField(max_length=65535, blank=True, null=True)
    problem_output = models.TextField(max_length=65535, blank=True, null=True)
    problem_sample_input = models.TextField(
        max_length=65535, blank=True, null=True)
    problem_sample_output = models.TextField(
        max_length=65535, blank=True, null=True)
    problem_hint = models.TextField(max_length=65535, blank=True, null=True)
    problem_source = models.TextField(max_length=65535, blank=True, null=True)
    probelm_time_limit = models.IntegerField(default=1000)
    problem_memory_limit = models.IntegerField(default=10000)
    problem_total_submissions = models.IntegerField(default=0)
    problem_accepted = models.IntegerField(default=0)

    def __str__(self):
        return self.problem_name


class Profile(models.Model):
    user = models.ForeignKey(User, unique=True)
    username = models.CharField(max_length=1000, default='')
    jid = models.CharField(max_length=1000)
    state = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username

    class Meta:
        db_table = 'account_profile'
