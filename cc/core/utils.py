#!/usr/bin/env python
# -*- coding: utf-8 -*-
import subprocess
from cc.models import Profile


def cmd_run(command, stdin=None):
    '''
    run command in shell and return retcode, stdout and stderr
    '''
    if not isinstance(command, list):
        raise TypeError
    p = subprocess.Popen(
        command,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        shell=True,
    )
    stdout, stderr = p.communicate(stdin)
    return (p.returncode, stdout, stderr)


def add_profile(user, jid, state=False):
    if user:
        try:
            p = Profile(
                user=user,
                username=user.username,
                jid=jid,
                state=state,
            )
            p.save()
            return True
        except Exception:
            pass
    return False


def update_profile(username, jid, state=False):
    try:
        p = Profile.objects.get(username=username)
        if p:
            if (p.jid != jid):
                p.jid = jid
            p.state = state
            p.save()
            return True
    except Exception:
        pass
    return False


def set_state(jid, state=False):
    try:
        p = Profile.objects.get(jid=jid)
        if p:
            p.state = state
            p.save()
            return True
    except Exception:
        pass
    return False


def get_state(jid):
    try:
        p = Profile.objects.get(jid=jid)
        if p:
            return p.state
    except Exception:
        pass
    return False


def get_current_jid(username):
    try:
        p = Profile.objects.get(username=username)
        if p.state:
            return p.jid
    except Exception:
        pass
    return ''
