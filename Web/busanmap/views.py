from django.shortcuts import render
import pandas as pd


# # Create your views here.
# def chartPage(request):
#     context = {'a': 'a'}
#     return render(request, 'chart.html')


# def indexPage(request):
#     df = pd.read_excel('PIH_merge.xlsx')
#     df_i = df[['ZONE', 'IMP_SUR_RATIO']].sort_values(by='ZONE', ascending=True)
#     df_p = df[['ZONE', 'PUMP_RATIO']].sort_values(by='ZONE', ascending=True)
#     df_m = df[['ZONE', 'MANHOLES_RATIO']].sort_values(by='ZONE', ascending=True)
#     zone = df_i['ZONE'].values.tolist()
#     imp = df_i['IMP_SUR_RATIO'].values.tolist()
#     pump = df_p['PUMP_RATIO'].values.tolist()
#     manhole = df_m['MANHOLES_RATIO'].values.tolist()
#     context = {
#         'zone': zone,
#         'imp': imp,
#         'pump': pump,
#         'manhole': manhole
#     }
#     return render(request, 'busanmap/main.html', context=context)
