import xmltodict
import requests
import json
from discord.ext import commands
from datetime import timedelta, date as dt
from discord import Embed
from re import compile

class Mensa(commands.Cog):

    def __init__(self, bot):
        self.bot = bot

    @commands.command()  # !essen
    async def essen(self, ctx, location='strana', date='heute'):
        payload = getPayload(location, date)
        data = getData(payload)
        intro = parseIntro(payload)
        meals = parseMeals(data)
        await ctx.send(content=intro, embed=meals)
        print(f'>>> Showed the menu to {ctx.message.author}')


def getPayload(location, date):
    if location == ('strana' or 'Strana' or 'StraNa' or 'STRANA' or 'straNa'):
        x = {'plan': '773823070'}
    else:
        x = {'plan': '1479835489'}

    t = t0 = dt.today()

    if date == 'heute':
        x['jahr'] = t.year
        x['monat'] = t.month
        x['tag'] = t.day
        return(x)

    elif date == 'morgen':
        x['jahr'] = (t + timedelta(days=1)).year
        x['monat'] = (t + timedelta(days=1)).month
        x['tag'] = (t + timedelta(days=1)).day
        return(x)

    elif date == 'übermorgen':
        x['jahr'] = (t + timedelta(days=2)).year
        x['monat'] = (t + timedelta(days=2)).month
        x['tag'] = (t + timedelta(days=2)).day
        return(x)

    else:
        i = 0

        while i <= 6:
            if date == t.strftime("%d.%m."):
                x['jahr'] = t.year
                x['monat'] = t.month
                x['tag'] = t.day
                return(x)
            t = t + timedelta(days=1)
            i += 1

    x['jahr'] = t0.year
    x['monat'] = t0.month
    x['tag'] = t0.day
    return(x)


def getData(payload):
    re = requests.get(
        'https://www.swcz.de/bilderspeiseplan/xml.php', params=payload)
    raw = json.loads(json.dumps(xmltodict.parse(re.text)))
    try:
        essen = raw['speiseplan']['essen']
    except:
        essen = False
    finally:
        return(essen)


def parseIntro(payload):
    if payload['plan'] == '773823070':
        return(f'Dieses Essen gibt es in der Mensa auf der Straße der Nationen 62 am `{payload["tag"]}.{payload["monat"]}.{payload["jahr"]}`:')
    else:
        return(f'Dieses Essen gibt es in der Mensa auf der Reichenhainer Straße 55 am `{payload["tag"]}.{payload["monat"]}.{payload["jahr"]}`:')


def parseMeals(data):
    meals = Embed()
    if data is False:
        meals.colour = 12401435
        meals.description = 'Für diesen Tag kann ich leider keinen Speiseplan finden.'
        return(meals)

    meals.colour = 6982182
    p = compile(' ?\(.*?\)')
    for meal in data:
        deutsch = p.sub('', meal['deutsch'])
        meals.add_field(name=meal["@kategorie"], value=f'{deutsch}\n`{meal["pr"][0]["@gruppe"]}: {meal["pr"][0]["#text"]}€\n{meal["pr"][1]["@gruppe"]}: {meal["pr"][1]["#text"]}€\n{meal["pr"][2]["@gruppe"]}: {meal["pr"][2]["#text"]}€`')
    return(meals)


if __name__ == '__main__':
    payload = {'plan': '773823070',
               'jahr': '2020',
               'monat': '10',
               'tag': '12'}

    re = requests.get(
        'https://www.swcz.de/bilderspeiseplan/xml.php', params=payload)

    print(re.text)

    dict = json.loads(json.dumps(xmltodict.parse(re.text)))

    try:
        essen = dict['speiseplan']['essen']
    except:
        essen = False

    if essen is False:
        print('Kein Essen an diesem Tag')

    else:
        for gericht in essen:
            print(gericht['@kategorie'])
            print(gericht['deutsch'])
            for preis in gericht['pr']:
                print(f'{preis["@gruppe"]}: {preis["#text"]}')
            print()