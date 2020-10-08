from discord.ext import commands
from discord.utils import get

class RoleManagement(commands.Cog):

    def __init__(self, bot):
        self.bot = bot

    @commands.command()  # !join
    async def join(self, ctx, *, argument):
        await ctx.message.delete()
        member = ctx.message.author
        if get(ctx.guild.roles, name=argument) is None:
            await ctx.send(f'The role `{argument}` does not exist. ¯\\_(ツ)_/¯',
                           delete_after=5.0)
        elif get(member.roles, name=argument) is not None:
            await ctx.send(f'You already have this role (`{argument}`)  ¯\\_(ツ)_/¯',
                           delete_after=5.0)
        elif argument == ('Admin' or 'bots' or 'bot.py'):
            await ctx.send(f':no_entry: You cannot access the role `{argument}`.',
                           delete_after=5.0)
        else:
            role = get(member.guild.roles, name=argument)
            await member.add_roles(role)
            await ctx.send(f':white_check_mark: You have been given the role `{argument}`.',
                           delete_after=5.0)
            print(f'>>> Gave {member} the role {argument}')

    @commands.command()  # !leave
    async def leave(self, ctx, *, argument):

        await ctx.message.delete()
        member = ctx.message.author

        if get(ctx.guild.roles, name=argument) is None:
            await ctx.send(f'The role `{argument}` does not exist. ¯\\_(ツ)_/¯',
                           delete_after=5.0)

        elif get(member.roles, name=argument) is None:
            await ctx.send(f'You don\'t have this role (`{argument}`)  ¯\\_(ツ)_/¯',
                           delete_after=5.0)

        else:

            role = get(member.guild.roles, name=argument)
            await member.remove_roles(role)
            await ctx.send(f':ballot_box_with_check: Your role `{argument}` has been removed.',
                           delete_after=5.0)
            print(f'>>> Removed the role {argument} from {member}')
