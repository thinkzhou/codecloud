##CodeCloud项目安装与部署
这里说明下怎么在linux系统里面安装CodeCloud以及先关的部署以ubuntu为例.
###安装MySQL与Python相关
```
sudo apt-get install mysql-server
sudo apt-get install python-setuptools python-dev build-essential
sudo apt-get install libmysqlclient-dev
```
###获取源代码与相关依赖包安装
获取源代码
```shell
git clone https://github.com/thinkzhou/codecloud.git
```
安装项目相关依赖
```shell
pip install -r requirements.txt
```
###安装与使用Ejabber服务器
安装Ejabber
```shell
sudo apt-get install ejabberd
```
添加一个账户
```shell
sudo ejabberdctl register your_name localhost your_password
```
将其加入管理员权限
```shell
sudo vim /etc/ejabberd/ejabberd.cfg
```
在
```
%% Admin user
{acl, admin, {user, "", "localhost"}}.
```
之后添加
```shell
{acl, admin, {user, "your_name", "localhost"}}.
{access, configure, [{allow, admin}]}.
```
重启ejabber服务器
```shell
sudo ejabberdctl restart
```
访问http://localhost:5280/admin/
用刚注册的账号your_name@localhost与密码登入即可

###创建数据库
进入项目目录执行
```shell
python manage.py syncdb
```
###启动项目
之前所有的都做完之后就可以启动了,访问http://localhost:8000/cc/ 查看
```shell
pyton manage.py runserver
```

