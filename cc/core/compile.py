#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
from utils import cmd_run


class Base_Compiler(object):

    """the base class for compiler"""

    def __init__(self, source):
        if not os.path.isfile(source):
            raise TypeError("source must be a file")
        self.source = source
        self.filepath, self.filename = os.path.split(self.source)
        self.shortname, self.extension = os.path.splitext(self.filename)
        self.executable_file = os.path.join(self.filepath, self.shortname)
        if self.extension in ['.c', '.cpp', '.cc']:
            self.file_type = 'cpp'
        elif self.extension in ['.java']:
            self.file_type = 'java'
        else:
            raise TypeError('extension is not supported, only c/c++')

    def build(self):
        '''
        build the source code and retrun return_code, stdout,stderr
        '''
        if self.file_type in ('c', 'cpp'):  # c/cpp
            cmd = [
                'g++',
                '-o',
                self.executable_file,
                self.source,
            ]
        else:  # java
            cmd = [
                'javac',
                self.source,
            ]
        command = [' '.join(item for item in cmd)]
        return cmd_run(command)

    def run(self, data_file):
        '''
        run the executable_file and use data_file as stdin
        return return_code, stdout,stderr
        '''
        if not os.path.isfile(data_file):
            raise TypeError("data file must be a file")
        try:
            with open(data_file, 'rt') as f:
                STDIN = f.read()
            if self.file_type in ('c', 'cpp'):
                cmd = [self.executable_file]
            else:
                cmd = [
                    'java',
                    '-classpath',
                    self.filepath,
                    self.shortname,
                ]
            command = [' '.join(item for item in cmd)]
            return cmd_run(command, STDIN)
        except IOError:
            raise IOError

    def build_and_run(self, data_file):
        try:
            ret_code, stdout, stderr = self.build()
            if not ret_code == 0:
                return ret_code, stdout, stderr
            return self.run(data_file)
        except IOError:
            raise IOError
