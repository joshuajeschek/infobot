from discord.ext import commands
from discord import Embed
import json

class Miscellaneous(commands.Cog):

    def __init__(self, bot):
        self.bot = bot

    @commands.command()  # !ping
    async def ping(self, ctx):
        ping = round(self.bot.latency * 1000)
        await ctx.send(f'My current ping: {ping}ms')
        print(
            f'>>> Showed my ping({ping}) to {ctx.message.author}')

    @commands.command()  # !invite
    async def invite(self, ctx):
        link = 'https://discord.gg/KVHKnFt'
        await ctx.send(f'Invite people to this server!\n{link}')
        print(f'>>> Showed invite to {ctx.message.author}')

    @commands.command()  # !help
    async def help(self, ctx, command='all'):
        if command == 'all':
            print('all')
        print(f'Tried to help {ctx.message.author}')


if __name__ == '__main__':
    f = open('help.json', 'r')
    d = json.loads(f.read())

    e = Embed.from_dict(d)

    print(d)
    print(e.title)
