import os
from utils import cmd_run, save_file

CUR_PATH = __file__
PAR_PATH = os.path.abspath(
    os.path.join(os.path.dirname(CUR_PATH), os.path.pardir)
)
JUDGE_PATH = os.path.join(PAR_PATH, 'judge')


class CodeComplie(object):

    def __init__(self, source):
        self.base_file_path = JUDGE_PATH
        source = os.path.join(self.base_file_path, source)
        if not os.path.isfile(source):
            raise TypeError("source file must be a file")
        self.source = source
        self.filepath, self.filename = os.path.split(self.source)
        self.shortname, self.extension = os.path.splitext(self.filename)
        self.executable_file = os.path.join(self.filepath, self.shortname)
        if self.extension in ['.c', '.cpp', '.cc']:
            self.file_type = 'cpp'
        elif self.extension in ['.java']:
            self.file_type = 'java'
        else:
            raise TypeError('extension is not supported, only C/C++/Java')

    def build(self):
        '''
        build the source code and retrun return_code, stdout,stderr
        '''
        if self.file_type in ('c', 'cpp'):  # c/cpp
            cmd = [
                os.path.join(self.base_file_path, "Compiler"),
                '1',
                os.path.join(self.base_file_path, self.source),
                self.base_file_path,
            ]
        else:  # java
            cmd = [
                'javac',
                self.source,
            ]
        command = [' '.join(item for item in cmd)]
        return cmd_run(command)

    def run(self, data_file, time_limit=2, memory_limit=100):
        '''
        run the executable_file and use data_file as stdin
        return return_code, stdout,stderr
        '''
        data_file = os.path.join(self.base_file_path, data_file)
        if not os.path.isfile(data_file):
            raise TypeError("data file must be a file")
        try:
            if self.file_type in ('c', 'cpp'):
                cmd = [
                    'cd',
                    self.base_file_path + ';',
                    os.path.join(self.base_file_path, "Judge"),
                    '1',
                    data_file,
                    self.base_file_path,
                    str(time_limit),
                    str(memory_limit),
                ]
                command = [' '.join(item for item in cmd)]
                return cmd_run(command)
            else:
                with open(data_file, 'rt') as f:
                    STDIN = f.read()
                cmd = [
                    'java',
                    '-classpath',
                    self.filepath,
                    self.shortname,
                ]
                command = [' '.join(item for item in cmd)]
                return cmd_run(command, STDIN)
        except Exception, e:
            raise Exception(e)

    def build_and_run(self, data_file, time_limit=2, memory_limit=100):
        try:
            b_code, b_out, b_err = self.build()
            r_code, r_out, r_err = self.run(
                data_file, time_limit, memory_limit)
            build_msg, run_msg, output = '', '', ''
            if self.file_type in ('c', 'cpp'):
                with open(os.path.join(self.base_file_path, 'ce.txt'), 'r') as f:
                    build_msg = f.read()
                with open(os.path.join(self.base_file_path, 'error.out'), 'r') as f:
                    run_msg = f.read()
                with open(os.path.join(self.base_file_path, 'user.out'), 'r') as f:
                    output = f.read()
                self.clearn()
            else:
                build_msg = b_out + b_err
                run_msg = r_err
                output = r_out
                print "build_msg: " + build_msg
                print "output: " + output
            return build_msg, run_msg, output
        except Exception, e:
            raise Exception(e)

    def clearn(self):
        clearn_file = [
            'ce.txt', 'error.out', 'user.out', 'Main', 'Main.cc', 'data.in'
        ]
        for f in clearn_file:
            abs_path = os.path.join(JUDGE_PATH, f)
            cmd = [
                'rm',
                '-rf',
                abs_path,
            ]
            command = [' '.join(item for item in cmd)]
            cmd_run(command)
        return True


def Judge(code, code_name, data):
    save_file(code, os.path.join(JUDGE_PATH, code_name))
    save_file(data, os.path.join(JUDGE_PATH, 'in.txt'))
    ccp = CodeComplie(code_name)
    build_msg, run_msg, output = ccp.build_and_run('in.txt')
    return (build_msg, run_msg, output)
