from datetime import timedelta, date
from time import sleep
import xmltodict
import requests
import json

td = date.today()
payload = {}
payload['plan'] = '1479835489'
categories = []

while td.year > 2010:
    payload['jahr'] = td.year
    payload['monat'] = td.month
    payload['tag'] = td.day

    print(td, end='\r')

    try:
        re = requests.get(
            'https://www.swcz.de/bilderspeiseplan/xml.php', params=payload)
        raw = json.loads(json.dumps(xmltodict.parse(re.text)))

        try:
            data = raw['speiseplan']['essen']
        except Exception:
            data = False

        if data is False:
            td = td - timedelta(days=1)
            continue
        for item in data:
            if item['@kategorie'] in categories:
                continue
            else:
                categories.append(item['@kategorie'])
            print(f'{item["@kategorie"]} - {td}', end='\n')
    except Exception:
        td = td - timedelta(days=1)
        continue
    else:
        td = td - timedelta(days=1)
    sleep(1)
