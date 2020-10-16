from discord.ext import commands

class Miscellaneous(commands.Cog):

    def __init__(self, bot):
        self.bot = bot

    @commands.command()  # !ping
    async def ping(self, ctx):
        ping = round(self.bot.latency * 1000)
        await ctx.send(f'My current ping: {ping}ms')
        print(f'>>> Showed my ping({ping}), as requested by {ctx.message.author}')

    @commands.command() # !help
    async def help(self, ctx):
