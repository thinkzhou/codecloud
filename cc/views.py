import json
from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django import forms
from django.contrib.auth.models import User
from django.contrib import auth
from django.contrib.auth.hashers import check_password
from cc.core.utils import *
from cc.models import Problem
from core.compile2 import Judge
from django.http import StreamingHttpResponse
import os
###################################
# forms
###################################


class UserForm(forms.Form):
    username = forms.CharField(label='username', max_length=100)
    password = forms.CharField(label='password', widget=forms.PasswordInput())


class passwordForm(forms.Form):
    current_password = forms.CharField(
        label='current Password', widget=forms.PasswordInput()
    )
    new_password = forms.CharField(
        label='new Password', widget=forms.PasswordInput()
    )


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


###################################
# login, reister and logout views
###################################
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
                # todo
                # create user from ejabber server
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
    return HttpResponseRedirect('/cc/')


def index(request):
    username = request.user.username
    return render_to_response('cc/index.html', locals())


def home(request):
    username = request.user.username
    return render_to_response('cc/home.html', locals())


def simple(request):
    return render_to_response('cc/simple.html', locals())


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


@login_required
def problem_show(request, problem_id):
    problem = Problem.objects.get(pk=problem_id)
    return render_to_response('cc/problem_show.html', locals())


@login_required
def setting(request):
    user = request.user
    return render_to_response('cc/setting.html', locals())


@login_required
def change_password(request):
    if request.method == 'POST':
        form = passwordForm(request.POST)
        if form.is_valid():
            current_password = form.cleaned_data['current_password']
            new_password = form.cleaned_data['new_password']
            user = request.user
            if check_password(current_password, encoded=user.password):
                user.set_password(new_password)
                user.save()
                return render_to_response(
                    'cc/action_result.html', {
                        'actions': 'change_password',
                        'result': 'success',
                    }
                )
            else:
                form.add_error(None, 'the pasword in not match')
        else:
            form.add_error(None, 'please check the form, you miss something.')
    else:
        form = passwordForm()
    return render_to_response(
        "cc/change_password.html",
        {'form': form, 'username': request.user.username},
        context_instance=RequestContext(request),
    )


@login_required
def discuss(request):
    username = request.user.username
    return render_to_response('cc/discuss.html', locals())


@login_required
def new_discuss(request):
    username = request.user.username
    return render_to_response('cc/new_discuss.html', locals())


def faq(request):
    return render_to_response('cc/faq.html')


def about(request):
    return render_to_response('cc/about.html')
###################################
# xmpp pages
###################################


def xmpp(request):
    return render_to_response('cc/xmpp.html')


def echobot(request):
    return render_to_response('cc/echobot.html')


def peek(request):
    return render_to_response('cc/peek.html')


def gab(request):
    return render_to_response('cc/gab.html')


def netpad(request):
    return render_to_response('cc/netpad.html')


def dig(request):
    return render_to_response('cc/dig.html')

###################################
# API for data exchanging
###################################


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


@login_required
@csrf_exempt
def update_jid(request):
    '''
    update state use jid
    '''
    user = request.user
    jid = request.POST.get('jid', '')
    state = request.POST.get('state', '') == 'true'
    result = False
    if jid:
        print 'updating jid', jid, state
        result = update_profile(
            username=user.username,
            jid=jid,
            state=state,
        )
    return HttpResponse(
        json.dumps(result),
        content_type="application/json"
    )


@login_required
@csrf_exempt
def get_jid(request):
    username = request.POST.get('name', '')
    data = {}
    if (username):
        # select from database
        jid = get_current_jid(username=username)
        print 'get jid', jid
        data['jid'] = jid
    else:
        data['jid'] = ''
    return HttpResponse(
        json.dumps(data),
        content_type="application/json"
    )


@login_required
@csrf_exempt
def test_code(request):
    username = request.user.username
    code = request.POST.get('code', '')
    data_input = request.POST.get('data_input', '')
    problem_id = request.POST.get('problem_id', '')
    lang = request.POST.get('lang', '')
    print lang
    extension = ".java" if lang == "Java" else ".cpp"
    print extension
    data = {}
    if code and data_input and problem_id:
        if extension == '.cpp':
            code_name = username + problem_id + extension
        else:
            code_name = "Main" + extension
        data['build_msg'], data['run_msg'], data[
            'output'] = Judge(code, code_name, data_input)
    return HttpResponse(
        json.dumps(data),
        content_type="application/json"
    )
def editor(request):
    return render_to_response('cc/editor.html')


def download(request, file_name):
    base_path = '/Users/zhouyang/upload/'
    def file_iterator(file_name,chunk_size = 1024):
        with open(file_name) as f:
            while True:
                c = f.read(chunk_size)
                if c:
                    yield c
                else:
                    break
    the_file_name = os.path.join(base_path,file_name)
    print file_name
    print the_file_name
    if file_name and os.path.exists(the_file_name) and os.path.isfile(the_file_name):
        response = HttpResponse(file_iterator(the_file_name))
        response['Content-Type'] = 'application/octet-stream'
        response['Content-Disposition'] = 'attachment;filename="{0}"'.format(file_name)
    else:
        response = HttpResponse('can not find %s, please check the file name'%the_file_name)
    return response

