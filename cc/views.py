import json
from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from django import forms
from django.contrib.auth.models import User
from django.contrib import auth


from cc.models import Problem

###################################
# login, reister and logout views
###################################


class UserForm(forms.Form):
    username = forms.CharField(label='username', max_length=100)
    password = forms.CharField(label='password', widget=forms.PasswordInput())


def login(request):
    if request.method == 'POST':
        form = UserForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = auth.authenticate(username=username, password=password)
            if user is not None and user.is_active:
                auth.login(request, user)
                return HttpResponseRedirect('/cc/home/')
        form.add_error(None, 'username and password is not match')
    else:
        form = UserForm()
    return render_to_response(
        "cc/login.html", {'form': form},
        context_instance=RequestContext(request),
    )


def register(request):
    if request.method == 'POST':
        form = UserForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            try:
                User.objects.create_user(
                    username=username,
                    password=password,
                )
                return HttpResponseRedirect("/cc/register_success")
            except Exception:
                form.add_error(None, 'duplicate username')
    else:
        form = UserForm()
    return render_to_response(
        "cc/register.html", {'form': form},
        context_instance=RequestContext(request),
    )


def register_success(request):
    return render_to_response('cc/register_success.html')


def logout(request):
    auth.logout(request)
    return HttpResponseRedirect('/cc/loggedout/')


def loggedout(request):
    return render_to_response('cc/loggedout.html')

#########################################
#########################################


def index(request):
    return render_to_response('cc/index.html', locals())


@login_required
def home(request):
    username = request.user.username
    return render_to_response('cc/home.html', locals())


class Problem_Form(forms.Form):
    problem_name = forms.CharField(label='name', max_length=100)
    problem_description = forms.CharField(
        label='description', widget=forms.Textarea)
    problem_input = forms.CharField(label='input', widget=forms.Textarea)
    problem_output = forms.CharField(label='output', widget=forms.Textarea)
    problem_sample_input = forms.CharField(
        label='simple_input', widget=forms.Textarea)
    problem_sample_output = forms.CharField(
        label='simple_output', widget=forms.Textarea)
    problem_hint = forms.CharField(label='hint', widget=forms.Textarea)
    problem_source = forms.CharField(label='source', widget=forms.Textarea)
    probelm_time_limit = forms.IntegerField(label='time_limit')
    problem_memory_limit = forms.IntegerField(label='memory_limit')
    problem_total_submissions = forms.IntegerField(label='total_submissions')
    problem_accepted = forms.IntegerField(label='accepted')


@login_required
def add_problem(request):
    if not request.user.is_superuser:
        raise Http404
    if request.method == 'POST':
        form = Problem_Form(request.POST)
        if form.is_valid():
            problem_name = form.cleaned_data['problem_name']
            problem_description = form.cleaned_data['problem_description']
            problem_input = form.cleaned_data['problem_input']
            problem_output = form.cleaned_data['problem_output']
            problem_sample_input = form.cleaned_data['problem_sample_input']
            problem_sample_output = form.cleaned_data['problem_sample_output']
            problem_hint = form.cleaned_data['problem_hint']
            problem_source = form.cleaned_data['problem_source']
            probelm_time_limit = form.cleaned_data['probelm_time_limit']
            problem_memory_limit = form.cleaned_data['problem_memory_limit']
            problem_total_submissions = form.cleaned_data[
                'problem_total_submissions']
            problem_accepted = form.cleaned_data['problem_accepted']
            problem = Problem(
                problem_name=problem_name,
                problem_description=problem_description,
                problem_input=problem_input,
                problem_output=problem_output,
                problem_sample_input=problem_sample_input,
                problem_sample_output=problem_sample_output,
                problem_hint=problem_hint,
                problem_source=problem_source,
                probelm_time_limit=probelm_time_limit,
                problem_memory_limit=problem_memory_limit,
                problem_total_submissions=problem_total_submissions,
                problem_accepted=problem_accepted,
            )
            try:
                problem.save()
                return render_to_response(
                    'cc/action_result.html', {
                        'actions': 'add_problem',
                        'result': 'success',
                    }
                )
            except Exception, e:
                return render_to_response(
                    'cc/action_result.html', {
                        'actions': 'add_problem',
                        'result': 'failed',
                        'error_message': e,
                    }
                )
        form.add_error(None, 'please check the form, you miss something.')
    else:
        form = Problem_Form()
    return render_to_response(
        "cc/add_problem.html", {'form': form},
        context_instance=RequestContext(request),
    )


@login_required
def problem_list(request):
    problems = Problem.objects.all()
    return render_to_response('cc/problem_list.html', locals())


@login_required
def problem_detail(request, problem_id):
    problem = Problem.objects.get(pk=problem_id)
    return render_to_response('cc/problem_detail.html', locals())


def get_data(request):
    cpp_keyword = [
        "asm", "do", "if", "return", "typedef", "auto", "double", "inline",
        "short", "typeid", "bool", "dynamic_cast", "int", "signed", "typename",
        "break", "else", "long", "sizeof", "union", "case", "enum", "mutable",
        "static", "unsigned", "catch", "explicit", "namespace", "static_cast",
        "using", "char", "export", "new", "struct", "virtual", "class",
        "extern", "operator", "switch", "void", "const", "false", "private",
        "template", "volatile", "const_cast", "float", "protected", "this",
        "wchar_t", "continue", "for", "public", "throw", "while", "default",
        "friend", "register", "true", "delete", "goto", "reinterpret_cast",
        "try", "iostream", "algorithm", "cstdio", "cstring", "cmath", "string",
        "include", "define", "bits/stdc++.h",
    ]
    key_word = [{"word": key}for key in cpp_keyword]
    return HttpResponse(
        json.dumps(key_word),
        content_type="application/json"
    )
