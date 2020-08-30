from django.http import HttpResponse
from django.template import loader
import pandas as pd
from django.shortcuts import render


def show_busan_map(request):
    def get():
        template = loader.get_template('busandong/main.html')
        return HttpResponse(template.render())

    if request.method == 'GET':
        return get()
    else:
        return HttpResponse(status=405)


def indexP(request):
    df = pd.read_excel('F_Final_PIH_V1.xlsx')
    df2 = df[['Dong', 'HIGH', 'PUMP_RATIO', 'IMP_SUR_RATIO', 'MANHOLES_RATIO']].groupby('Dong').mean().reset_index()
    dong = df2['Dong'].values.tolist()
    high = df2['HIGH'].values.tolist()
    pump = df2['PUMP_RATIO'].values.tolist()
    imp = df2['IMP_SUR_RATIO'].values.tolist()
    manhole = df2['MANHOLES_RATIO'].values.tolist()

    context = {
        'dong': dong,
        'high': high,
        'pump': pump,
        'imp': imp,
        'manhole': manhole,
    }
    return render(request, 'busandong/main.html', context=context)
