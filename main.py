import discord
from discord.ext import commands
from decouple import config
from PyInquirer import prompt

from admin import AdminTools
from misc import Miscellaneous
from roles import RoleManagement


cogs = (AdminTools, Miscellaneous, RoleManagement)


def application_choice():  # choosing application
    application_question = [
        {
            'type': 'list',
            'name': 'application',
            'message': 'Which application should be logged in?',
            'choices': ['Chester McTester', 'infobot'],
        },
    ]
    application = prompt(application_question)

    print('...')

    if application['application'] == 'infobot':
        return config('TOKEN')
    else:
        return config('TEST')


if __name__ == '__main__':

    client = commands.Bot(command_prefix='!')

    for cog in cogs:
        client.add_cog(cog(client))
        print(f'Added cog {cog}')

    @client.event  # Connection confirmation
    async def on_ready():
        await client.change_presence(activity=discord.Activity(type=discord.ActivityType.watching, name="Prefix: '!'"))
        print(f'🆗 {client.user} has connected to Discord!')

    client.run(application_choice())
