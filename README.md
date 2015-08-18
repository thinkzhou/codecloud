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
###使用Apache+mod_wsgi部署

安装对应软件包

```
apt-get install apache2 
apt-get install libapache2-mod-wsgi
```
假设项目代码放在/var/www/下。

静态文件处理，创建目录存放静态文件,假设目录为/static,后面的apache配置文件中需要相关配置。
```
#使用django manage.py导出静态文件
vim /var/www/codecloud/codecloud/settings.py
加入
STATIC_ROOT = '/static/'
退出vim
cd /var/www/codecloud/
python manage.py collectstatic
```

配置相应文件

```
#/etc/apache2/sites-enabled/codecloud.conf
ServerName codecloud
DocumentRoot /var/www/codecloud
<Directory /var/www/codecloud>
Order allow,deny
Allow from all
Require all granted
</Directory>
WSGIDaemonProcess codecloud processes=2 threads=15 display-name=%{GROUP}
WSGIProcessGroup codecloud
WSGIScriptAlias / /var/www/codecloud/codecloud/apache/django.wsgi
Alias /static "/static"
<Directory /static>
Order allow,deny
Allow from all
Require all granted
</Directory>
```

```
#/var/www/codecloud/codecloud/apache/django.wsgi
import os
import sys
path = '/var/www/codecloud'
if path not in sys.path:
sys.path.insert(0,'/var/www/codecloud/')
os.environ['DJANGO_SETTINGS_MODULE'] = 'codecloud.settings'
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

```
#/var/www/codecloud/codecloud/wsgi.py
import os,sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "codecloud.settings")
os.environ['PYTHON_EGG_CACHE'] = '/root/.virtualenvs'
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```
重启apache 服务，访问测试
```
service apache restart
```

