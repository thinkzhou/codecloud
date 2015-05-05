from core.compile2 import Judge
# Create your tests here.
if __name__ == "__main__":
    code = '''#include <iostream>
using namespace std;
int main(){
    int a,b;
    while(cin>>a>>b){
        cout<<a+b<<endl;
    }
    return 0;
}
    '''
    data = '''
    1 2
    3 4
    '''
    build_msg, run_msg, output = Judge(code, 'b.cpp', data)
    print build_msg
    print run_msg
    print output
