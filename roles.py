from discord.ext import commands
from discord.utils import get
import json
from discord import RawReactionActionEvent
from decouple import config


class RoleManagement(commands.Cog):

    def __init__(self, bot):
        self.bot = bot
        self.bad = ['Admin', 'bots', 'bot.py', 'Jaskier', 'Server Booster']

    @commands.Cog.listener()  # Reaction role adding
    async def on_raw_reaction_add(self, ctx: RawReactionActionEvent):

        role, member, state = self.parseReactionPayload(ctx)
        rChan = self.bot.get_channel(config('REACTCHANNELID'))

        if role is None:
            return

        if state is True:
            await rChan.send(f'You already have this role - unreact to delete it (if you want)',
                             delete_after=5.0)

        else:
            await member.add_roles(role)
            await rChan.send(f':white_check_mark: You have been given the role `{role.name}`.',
                             delete_after=5.0)
            print(f'>>> Gave {member} the role {role} (reaction)')

    @commands.Cog.listener()  # Reaction role removal
    async def on_raw_reaction_remove(self, ctx: RawReactionActionEvent):

        role, member, state = self.parseReactionPayload(ctx)
        rChan = self.bot.get_channel(config('REACTCHANNELID'))

        if role is None:
            return

        if state is False:
            await rChan.send(f'You didn\'t have this role - react to get it (if you want)',
                             delete_after=5.0)

        else:
            await member.remove_roles(role)
            await rChan.send(f':ballot_box_with_check: Your role `{role.name}` has been removed.',
                             delete_after=5.0)
            print(
                f'>>> Removed the role {role.name} from {member} (reaction)')

    def parseReactionPayload(self, payload: RawReactionActionEvent):
        rolelist = {}
        f = open('resources/roles.json', 'r')
        rolelist = json.loads(f.read())
        f.close()

        guild_id = payload.guild_id

        if payload.user_id == (config('BOTID') or config('CHESTERID')):  # compare to bots
            return None, None, None

        if payload.emoji.name in rolelist.keys():
            if payload.message_id == config('REACTCHANNELID'):
                if payload.channel_id == config('REACTMESSAGEID'):

                    guild = self.bot.get_guild(guild_id)

                    role = guild.get_role(rolelist[payload.emoji.name])

                    member = guild.get_member(payload.user_id)

                    if role in member.roles:
                        state = True
                    else:
                        state = False

                    return role, member, state
        return None, None, None

    @commands.command()  # !join - just don't use it.
    async def join(self, ctx, *, argument):
        await ctx.message.delete()
        if argument in self.bad:
            await ctx.send(f':no_entry: You cannot access the role `{argument}`.',
                           delete_after=5.0)
            return()
        member, role, has_role = parsePayload(ctx, argument)
        if role is None:
            await ctx.send(f'The role `{argument}` does not exist. ¯\\_(ツ)_/¯',
                           delete_after=5.0)
        elif has_role is not None:
            await ctx.send(f'You already have this role (`{argument}`)  ¯\\_(ツ)_/¯',
                           delete_after=5.0)
        else:
            await member.add_roles(role)
            await ctx.send(f':white_check_mark: You have been given the role `{argument}`.',
                           delete_after=5.0)
            print(f'>>> Gave {member} the role {argument}')

    @commands.command()  # !leave - just don't use it.
    async def leave(self, ctx, *, argument):
        await ctx.message.delete()
        member, role, has_role = parsePayload(ctx, argument)
        if role is None:
            await ctx.send(f'The role `{argument}` does not exist. ¯\\_(ツ)_/¯',
                           delete_after=5.0)
        elif has_role is None:
            await ctx.send(f'You don\'t have this role (`{argument}`)  ¯\\_(ツ)_/¯',
                           delete_after=5.0)
        else:
            await member.remove_roles(role)
            await ctx.send(f':ballot_box_with_check: Your role `{argument}` has been removed.',
                           delete_after=5.0)
            print(f'>>> Removed the role {argument} from {member}')


def getRole(guild, role):
    role = get(guild.roles, name=role)
    return(role)


def parsePayload(ctx, argument):
    member = ctx.message.author
    role = get(ctx.guild.roles, name=argument)
    has_role = get(member.roles, name=argument)
    return(member, role, has_role)
