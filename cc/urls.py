from django.conf.urls import patterns, url
from cc import views

urlpatterns = patterns(
    '',
    url(r'^$', views.index, name='index'),
    url(r'^data$', views.get_data, name='data'),
    url(r'^login/$', views.login),
    url(r'^logout/$', views.logout),
    url(r'^home/$', views.home),
    url(r'^register/$', views.register),
    url(r'^register_success/$', views.register_success),
    url(r'^problem/add/$', views.add_problem),
    url(r'^problem/list/$', views.problem_list),
    url(r'^problem/show/(?P<problem_id>\d+)/$', views.problem_show),
    url(r'^setting/$', views.setting),
    url(r'^password/change/$', views.change_password),
    url(r'^xmpp/$', views.xmpp),
    url(r'^echo/$', views.echobot),
    url(r'^peek/$', views.peek),
    url(r'^gab/$', views.gab),
    url(r'^netpad/$', views.netpad),
    url(r'^dig/$', views.dig),
    url(r'^ajax/update_jid/$', views.update_jid),
    url(r'^ajax/get_jid/$', views.get_jid),
    url(r'^ajax/test_code/$', views.test_code),
    url(r'^editor/$', views.editor),
    url(r'^faq/$', views.faq),
    url(r'^about/$', views.about),
    url(r'^simple/$', views.simple),
    url(r'^discuss/$', views.discuss),
    url(r'^discuss/new/$', views.new_discuss),
)
