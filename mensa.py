import xmltodict
import requests
import json
from decouple import config
from discord.ext import commands, tasks
from datetime import timedelta, datetime, date as dt
from discord import Embed
from re import compile

categoriemoji = {
    'Pastatheke': ':spaghetti:',
    'Abend - Grill-Diner': ':meat_on_bone:',
    'Heiße Theke - Pastabar': ':spaghetti:',
    'Ofen': ':pie:',
    'Schneller Teller': ':fork_knife_plate:',
    'Pizza': ':pizza:',
    'Abend - Get your Bowl': ':bowl_with_spoon:',
    'Grill': ':meat_on_bone:',
    'Abend - Schnitzel satt': ':stew:',
    'Heiße Theke': ':hotsprings:',
    'Wok': ':shallow_pan_of_food:',
    'Abend - Burger-Dinner': ':hamburger:',
    'Heiße Theke - Suppe': ':bowl_with_spoon:',
    'Pasta': ':spaghetti:',
    'Wok - mensaVital': ':shallow_pan_of_food:',
    'mensaVital': ':salad:',
    'Campusteller': ':fork_knife_plate:',
    'Campus Cooking': ':stuffed_flatbread:',
    'Essen 1': ':salad:',
    'Abend - Pasta, Pasta': ':spaghetti:',
    'Catch of the day': ':fishing_pole_and_fish:',
    'Bioessen (DE-ÖKO-006)': ':herb:',
    'Heiße Theke - Eintopf': ':ramen:',
    'Ofen - mensaVital': ':pie:'
}

class Mensa(commands.Cog):

    def __init__(self, bot, app):
        self.bot = bot
        if app == config('INFOBOT'):
            self.essenChannelId = config('ESSENCHANNELID', cast=int)
            self.essenRoleId = config('ESSENROLEID', cast=int)
        elif app == config('TEST'):
            self.essenChannelId = config('ESSENCHANNELIDC', cast=int)
            self.essenRoleId = config('ESSENROLEIDC', cast=int)
        self.menuPresenter.start()

    def cog_unload(self):
        self.menuPresenter.cancel()

    @commands.command(aliases=['e'])  # !essen
    async def essen(self, ctx, location='rh', date='heute'):
        payload = getPayload(location, date)
        data = getData(payload)
        intro = parseIntro(payload)
        meals = parseMeals(data)
        await ctx.send(content=intro, embed=meals)
        print(f'>>> Showed the menu to {ctx.message.author}')

    @tasks.loop(hours=1)
    async def menuPresenter(self):
        if checkDatetime() is False:
            print('>>> no menu presented')
        else:
            eChan = self.bot.get_channel(self.essenChannelId)
            for location in ['rh']:     # insert strana when open again
                payload = getPayload(location, 'heute')
                data = getData(payload)
                intro = f'<@&{self.essenRoleId}>\n' + parseIntro(payload)
                meals = parseMeals(data)
                await eChan.send(content=intro, embed=meals)
                print(f'>>> Showed the menu to @essen ({location})')

    @menuPresenter.before_loop
    async def before_menuPresenter(self):
        print('waiting...(menuPresenter)')
        await self.bot.wait_until_ready()


def getPayload(location, date):
    if location == ('strana' or 'Strana' or 'StraNa' or 'STRANA' or 'straNa'):
        x = {'plan': '773823070'}
    else:
        x = {'plan': '1479835489'}

    t = t0 = dt.today()

    x['jahr'] = t0.year
    x['monat'] = t0.month
    x['tag'] = t0.day

    if date in ['heute', 'h']:
        return(x)

    elif date in ['morgen', 'm']:
        x['jahr'] = (t + timedelta(days=1)).year
        x['monat'] = (t + timedelta(days=1)).month
        x['tag'] = (t + timedelta(days=1)).day
        return(x)

    elif date in ['übermorgen', 'ü']:
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

    return(x)


def getData(payload):
    re = requests.get(
        'https://www.swcz.de/bilderspeiseplan/xml.php', params=payload)
    raw = json.loads(json.dumps(xmltodict.parse(re.text)))
    try:
        essen = raw['speiseplan']['essen']
    except Exception:
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
    p = compile(r' ?\(.*?\)')
    for meal in data:
        if meal['@kategorie'] == 'Hinweis':
            continue
        if meal['@kategorie'] in categoriemoji.keys():
            meal['@kategorie'] += f' {categoriemoji[meal["@kategorie"]]}'
        deutsch = p.sub('', meal['deutsch'])
        meals.add_field(
            name=meal["@kategorie"],
            value=f'{deutsch}\n`{meal["pr"][0]["@gruppe"]}: {meal["pr"][0]["#text"]}€\n{meal["pr"][1]["@gruppe"]}: {meal["pr"][1]["#text"]}€\n{meal["pr"][2]["@gruppe"]}: {meal["pr"][2]["#text"]}€`')
    return(meals)


def checkDatetime():
    now = datetime.now()
    if now.weekday() <= 5:
        return False
    elif now.hour != 8:
        return False
    return True


# for testing purposes only, mensa.py should always be imported as a cog!
if __name__ == '__main__':
    payload = {'plan': '1479835489',
               'jahr': '2020',
               'monat': '10',
               'tag': '23'}

    re = requests.get(
        'https://www.swcz.de/bilderspeiseplan/xml.php', params=payload)

    print(re.text)

    dict = json.loads(json.dumps(xmltodict.parse(re.text)))

    print(dict)

    try:
        essen = dict['speiseplan']['essen']
    except Exception:
        essen = False

    if essen is False:
        print('Kein Essen an diesem Tag')

    else:
        for gericht in essen:
            if gericht['@kategorie'] == 'Hinweis':
                continue
            print(gericht['@kategorie'])
            print(gericht['deutsch'])
            for preis in gericht['pr']:
                print(f'{preis["@gruppe"]}: {preis["#text"]}')
            print()
