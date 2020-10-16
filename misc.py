from discord.ext import commands

class Miscellaneous(commands.Cog):

    def __init__(self, bot):
        self.bot = bot

    @commands.command()  # !ping
    async def ping(self, ctx):
        ping = round(self.bot.latency * 1000)
        await ctx.send(f'My current ping is: {ping}ms')
        print(f'>>> Showed my ping({ping}) to {ctx.message.author}')

    @commands.command()  # !invite
    async def invite(self, ctx):
        link = 'https://discord.gg/KVHKnFt'
        await ctx.send(f'Invite people to this server!\n{link}')
        print(f'>>> Showed invite to {ctx.message.author}')
