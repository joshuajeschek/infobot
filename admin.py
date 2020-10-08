from discord.ext import commands

class AdminTools(commands.Cog):

    @commands.command(hidden=True)  # !clear
    @commands.has_role("Admin")
    async def clear(self, ctx, amount=1):
        await ctx.channel.purge(limit=(amount + 1))
        await ctx.send(f'Cleared {amount} message(s)', delete_after=3.0)
        print(f'>>> Cleared {amount} message(s) in {ctx.guild}, {ctx.channel} as requested by {ctx.message.author}')
