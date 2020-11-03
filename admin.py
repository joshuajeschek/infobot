from discord.ext import commands
from discord import Message, TextChannel
from functions import openEmbed

class AdminTools(commands.Cog):

    def __init__(self, bot, app):
        self.bot = bot

    @commands.command(hidden=True)  # !clear
    @commands.has_role("Admin")
    async def clear(self, ctx, amount=1):
        await ctx.channel.purge(limit=(amount + 1))
        await ctx.send(f'Cleared {amount} message(s)', delete_after=3.0)
        print(
            f'>>> Cleared {amount} message(s) in {ctx.guild}, {ctx.channel} as requested by {ctx.message.author}')

    @commands.command(hidden=True)  # !react
    @commands.has_role("Admin")
    async def react(self, ctx, msg: Message, emoji):
        await msg.add_reaction(emoji)
        print(
            f'>>> Added reaction {emoji} to message in channel "{msg.channel.name}", as requested by {ctx.message.author}')

    @commands.command(hidden=True)  # !edit embed
    @commands.has_role("Admin")
    async def edit(self, ctx, msg: Message, arg):
        e = openEmbed(f'embeds/{arg}.json')
        await msg.edit(embed=e)
        print(
            f'>>> Edited embed in channel "{msg.channel.name}", as requested by {ctx.message.author}')

    @commands.command(hidden=True)  # !post embed
    @commands.has_role("Admin")
    async def post(self, ctx, channel: TextChannel, arg):
        e = openEmbed(f'embeds/{arg}.json')
        await channel.send(embed=e)
        print(
            f'>>> Sent embed in channel "{channel}", as requested by {ctx.message.author}')


if __name__ == '__main__':
    print("Don't excecute this file like this :o")
