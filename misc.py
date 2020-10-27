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
    async def help(self, ctx, command='help'):
        try:
            f = open(f'help/{command}.json', 'r')
            d = json.loads(f.read())
            f.close()
            e = Embed.from_dict(d)
            await ctx.send(embed=e)
        except FileNotFoundError:
            await ctx.send(
                f'Der Command `!{command}` existiert nicht, oder wurde nicht dokumentiert.',
                delete_after=3.0)
            await ctx.message.delete()
        print(f'Tried to help {ctx.message.author}')


if __name__ == '__main__':
    print('Maybe try starting the bot with main.py')
