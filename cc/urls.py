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
    url(r'^register_success/$', views.register_success)
)
