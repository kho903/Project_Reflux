from django.contrib import admin
from django.urls import path, include
from d3_korea_map.map import show_korea_map

urlpatterns = [
    path('', show_korea_map, name='KoreaMap'),
]