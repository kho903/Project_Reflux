from django.http import HttpResponse
from django.template import loader
import pandas as pd
from django.shortcuts import render


def show_busan_map(request):
    def get():
        template = loader.get_template('busanmap/main.html')
        return HttpResponse(template.render())
    if request.method == 'GET':
        return get()
    else:
        return HttpResponse(status=405)


def indexP(request):
    df = pd.read_excel('PIH_merge.xlsx')
    df_lv = pd.read_excel('F_BIN_WEIGHT_INFO.xlsx')
    df_lv_v = df_lv[['ZONE', 'F_GRADE']].sort_values(by='ZONE', ascending=True)
    grade = df_lv_v['F_GRADE'].values.tolist()

    df_i = df[['ZONE', 'IMP_SUR_RATIO']].sort_values(by='ZONE', ascending=True)
    df_p = df[['ZONE', 'PUMP_RATIO']].sort_values(by='ZONE', ascending=True)
    df_m = df[['ZONE', 'MANHOLES_RATIO']].sort_values(by='ZONE', ascending=True)
    zone = df_i['ZONE'].values.tolist()
    imp = df_i['IMP_SUR_RATIO'].values.tolist()
    pump = df_p['PUMP_RATIO'].values.tolist()
    manhole = df_m['MANHOLES_RATIO'].values.tolist()
    context = {
        'zone': zone,
        'imp': imp,
        'pump': pump,
        'manhole': manhole,
        'grade': grade
    }
    return render(request, 'busanmap/main.html', context=context)