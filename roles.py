from discord.ext import commands
from discord.utils import get
import json
from discord import RawReactionActionEvent

rolelist = {}

f = open('resources/roles.json', 'r')
rolelist = json.loads(f.read())
f.close()


class RoleManagement(commands.Cog):

    def __init__(self, bot):
        self.bot = bot
        self.bad = ['Admin', 'bots', 'bot.py', 'Jaskier', 'Server Booster']

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
        elif argument in self.bad:
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

    @commands.Cog.listener()  # Reaction role adding
    async def on_raw_reaction_add(self, ctx: RawReactionActionEvent):

        role, member, state = self.parse_reaction_payload(ctx)
        rChan = self.bot.get_channel(id=771456574202839056)

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

        role, member, state = self.parse_reaction_payload(ctx)
        rChan = self.bot.get_channel(id=771456574202839056)

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
                f'>>> Removed the role {role.name} from {member}(reaction)')

    def parse_reaction_payload(self, payload: RawReactionActionEvent):
        guild_id = payload.guild_id
        if payload.user_id == (740892561237082184 or 763145622076915742):  # compare to bots
            return None, None, None
        if payload.emoji.name in rolelist.keys():
            if payload.message_id == 771714847255298048:
                if payload.channel_id == 771456574202839056:

                    guild = self.bot.get_guild(guild_id)

                    role = guild.get_role(rolelist[payload.emoji.name])

                    member = guild.get_member(payload.user_id)

                    if role in member.roles:
                        state = True
                    else:
                        state = False

                    return role, member, state
        return None, None, None


def getRole(guild, role):
    role = get(guild.roles, name=role)
    return(role)
