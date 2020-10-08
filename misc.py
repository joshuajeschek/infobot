from discord.ext import commands

class Miscellaneous(commands.Cog):

    def __init__(self, bot):
        self.bot = bot

    @commands.command()  # !ping
    async def ping(self, ctx):
        await ctx.send(f'My current ping: {round(self.bot.latency * 1000)}ms')
        print(f'>>> Showed my ping, as requested by {ctx.message.author}')
