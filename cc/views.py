import json

from django.shortcuts import render, render_to_response
from django.http import HttpResponse
from django.template import RequestContext, loader

# Create your views here.


def index(request):
    return render_to_response('cc/simple.html')


def get_data(request):
    key_word = [
        {"word": "asm"},
        {"word": "do"},
        {"word": "if"},
        {"word": "return"},
        {"word": "typedef"},
        {"word": "auto"},
        {"word": "double"},
        {"word": "inline"},
        {"word": "short"},
        {"word": "typeid"},
        {"word": "bool"},
        {"word": "dynamic_cast"},
        {"word": "int"},
        {"word": "signed"},
        {"word": "typename"},
        {"word": "break"},
        {"word": "else"},
        {"word": "long"},
        {"word": "sizeof"},
        {"word": "union"},
        {"word": "case"},
        {"word": "enum"},
        {"word": "mutable"},
        {"word": "static"},
        {"word": "unsigned"},
        {"word": "catch"},
        {"word": "explicit"},
        {"word": "namespace"},
        {"word": "static_cast"},
        {"word": "using"},
        {"word": "char"},
        {"word": "export"},
        {"word": "new"},
        {"word": "struct"},
        {"word": "virtual"},
        {"word": "class"},
        {"word": "extern"},
        {"word": "operator"},
        {"word": "switch"},
        {"word": "void"},
        {"word": "const"},
        {"word": "false"},
        {"word": "private"},
        {"word": "template"},
        {"word": "volatile"},
        {"word": "const_cast"},
        {"word": "float"},
        {"word": "protected"},
        {"word": "this"},
        {"word": "wchar_t"},
        {"word": "continue"},
        {"word": "for"},
        {"word": "public"},
        {"word": "throw"},
        {"word": "while"},
        {"word": "default"},
        {"word": "friend"},
        {"word": "register"},
        {"word": "true"},
        {"word": "delete"},
        {"word": "goto"},
        {"word": "reinterpret_cast"},
        {"word": "try"},
        {"word": "include"},
    ]
    return HttpResponse(json.dumps(key_word),
                        content_type="application/json")
