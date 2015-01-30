from django.conf.urls import patterns, url
from cc import views

urlpatterns = patterns(
    '',
    url(r'^$', views.index, name='index'),
    url(r'^data$', views.get_data, name='data'),
    url(r'^login/$', views.login),
    url(r'^logout/$', views.logout),
    url(r'^loggedout/$', views.loggedout),
    url(r'^home/$', views.home),
    url(r'^register/$', views.register),
    url(r'^register_success/$', views.register_success),
    url(r'^add_problem/$', views.add_problem),
    url(r'problemlist/$', views.problem_list),
    url(r'problem/(?P<problem_id>\d+)/$', views.problem_detail)
)
