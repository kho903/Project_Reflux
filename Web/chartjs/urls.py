from django.contrib import admin
from django.urls import path, include

from chartjs import views

urlpatterns = [
    path('', views.indexPage, name='chart'),
]
