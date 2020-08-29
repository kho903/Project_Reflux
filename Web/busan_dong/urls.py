from django.contrib import admin
from django.urls import path, include

from busan_dong.map import indexP

urlpatterns = [
    path('', indexP, name='busandong'),
]
