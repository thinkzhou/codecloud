#!/usr/bin/env python
# -*- coding: utf-8 -*-
import subprocess


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
        shell=True
    )
    stdout, stderr = p.communicate(stdin)
    return (p.returncode, stdout, stderr)
