import json
from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from django import forms
from django.contrib.auth.models import User
from django.contrib import auth

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
