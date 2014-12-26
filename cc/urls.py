from django.conf.urls import patterns, url

from cc import views

urlpatterns = patterns(
    '',
    url(r'^$', views.index, name='index'),
    url(r'^data$', views.get_data, name='data'),
)
