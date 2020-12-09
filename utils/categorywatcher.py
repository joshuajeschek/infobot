from datetime import timedelta, date
from time import sleep
import xmltodict
import requests
import json
from discord_webhook import DiscordWebhook

plans = ['1479835489', '773823070']
payload = {}

tm = date.today() + timedelta(days=1)
categories = [
    'Abend - Grill-Diner',
    'Heiße Theke - Pastabar',
    'Ofen',
    'Schneller Teller',
    'Hinweis',
    'Pizza',
    'Abend - Get your Bowl',
    'Grill',
    'Abend - Schnitzel satt',
    'Heiße Theke',
    'Wok',
    'Abend - Burger-Dinner',
    'Heiße Theke - Suppe',
    'Pasta',
    'Wok - mensaVital',
    'mensaVital',
    'Campusteller',
    'Campus Cooking',
    'Essen 1',
    'Abend - Pasta, Pasta',
    'Catch of the day',
    'Bioessen (DE-ÖKO-006)',
    'Heiße Theke - Eintopf',
    'Ofen - mensaVital',
    'WICHTIG'
]

while True:
    tm = date.today() + timedelta(days=1)

    for plan in plans:
        payload['plan'] = plan
        payload['jahr'] = tm.year
        payload['monat'] = tm.month
        payload['tag'] = tm.day

        try:
            re = requests.get(
                'https://www.swcz.de/bilderspeiseplan/xml.php', params=payload)
            raw = json.loads(json.dumps(xmltodict.parse(re.text)))

            print(tm)

            try:
                data = raw['speiseplan']['essen']
            except Exception:
                data = False

            if data is False:
                tm = tm - timedelta(days=1)
                break
            for item in data:
                if item['@kategorie'] in categories:
                    continue
                else:
                    categories.append(item['@kategorie'])
                print(item['@kategorie'])
                webhook = DiscordWebhook(url='https://discordapp.com/api/webhooks/770308860207431760/oi5tZV9zEJYIX6_JEkhegzZHpD6TGCVAdVhYEsyn0H29ZJ6KdSCF6pgOWuYo5YkZ1AOU', content=f'A new category approaches: {item["@kategorie"]} `{tm}`')
                webhook.execute()
        except Exception:
            print('Something went wrong.')

    print('Sleeping for a bit')
    sleep(21599.87)
