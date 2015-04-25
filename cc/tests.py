from core.compile2 import CodeComplie
# Create your tests here.
if __name__ == "__main__":
	cp = CodeComplie("a.cpp")
	r_code, build_msg, run_msg, output= cp.build_and_run('in.txt')