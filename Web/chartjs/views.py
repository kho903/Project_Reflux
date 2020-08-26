from django.shortcuts import render


# Create your views here.
def chartPage(request):
    context = {'a': 'a'}
    return render(request, 'chart.html')
