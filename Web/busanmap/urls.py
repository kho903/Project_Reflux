from django.contrib import admin
from django.urls import path, include
from busanmap.map import show_busan_map, indexPage

urlpatterns = [
    path('', indexPage, name='BusanMap'),
]
