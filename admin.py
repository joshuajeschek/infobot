from discord.ext import commands
from discord import Message, Embed, TextChannel
import json

class AdminTools(commands.Cog):

    def __init__(self, bot):
        self.bot = bot

    @commands.command(hidden=True)  # !clear
    @commands.has_role("Admin")
    async def clear(self, ctx, amount=1):
        await ctx.channel.purge(limit=(amount + 1))
        await ctx.send(f'Cleared {amount} message(s)', delete_after=3.0)
        print(f'>>> Cleared {amount} message(s) in {ctx.guild}, {ctx.channel} as requested by {ctx.message.author}')

    @commands.command(hidden=True)  # !react
    @commands.has_role("Admin")
    async def react(self, ctx, msg: Message, emoji):
        await msg.add_reaction(emoji)
        print(f'>>> Added reaction {emoji} to message in channel "{msg.channel.name}", as requested by {ctx.message.author}')

    @commands.command(hidden=True)  # !edit
    @commands.has_role("Admin")
    async def edit(self, ctx, msg: Message, embed):
        f = open(f'embeds/{embed}.json', 'r')
        d = json.loads(f.read())
        f.close()
        e = Embed.from_dict(d)
        await msg.edit(embed=e)
        print(f'>>> Edited embed in channel "{msg.channel.name}", as requested by {ctx.message.author}')

    @commands.command(hidden=True)  # !post
    @commands.has_role("Admin")
    async def post(self, ctx, channel: TextChannel, embed):
        f = open(f'embeds/{embed}.json', 'r')
        d = json.loads(f.read())
        f.close()
        e = Embed.from_dict(d)
        await channel.send(embed=e)
        print(f'>>> Sent embed in channel "{channel}", as requested by {ctx.message.author}')
