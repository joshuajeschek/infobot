# infobot
This discord bot is automating different tasks on the / an unofficial server of the Faculty of Computer Science.
Please keep in mind that this is my first project with TypeScript, in case you see any weird practices.

## Features
- **Menu:** Get the menu at the mensa Reichenhainer Straße or Straße der Nationen, on any day you could possibly imagine
- **ReactionRoles:** React with an emoji to get assigned to a role. Can be configured by admin with commands
- **AutoReactions:** The bot can automatically react to messages sent to a channel, can be configured so that it only reacts to messages with attached media / URLs (good for meme channels)
- **Invite:** A command that shows the server invite, configurable 
- **AutoExecs:** Execute tasks on a schedule, e.g. showing the menu

***

## Commands
1. [Mensa](#mensa)  
    1.1 [menu](#menu)

2. [Utility](#utility)  
    2.1 [status](#status)  
    2.2 [invite](#invite)  
    2.3 [ping](#ping)  
    2.4 [help](#help)  

3. [Admin](#admin)  
    3.1 [setinvite](#setinivte)  
    3.2 [sendmessage](#sendmessage)  
    3.3 [editmessage](#editmessage)  
    3.4 [autoreact](#autoreact)  
    3.5 [autoexec](#autoexec)  
    3.6 [reactionrole](#reactionrole)  

### Mensa
#### menu
> `!menu <location> <date>`

The menu for the requested day and location is fetched and presented. When no parameters are provided, the location defaults to `reichenhainer` and date to `today`.

**examples:**
> `!menu`  
`!menu reichenhainer today`  
`!menu strana gestern`  
`!menu r 12.10.2016`  

**arguments:**
> `<location>` - `reichenhainer, strana, r, s`  
`<date>` - `today, tomorrow, heute, gestern, yesterday...` (or any date as numbers separated by "." )

### Utility
#### status
> `!status`

Returns some information about the bot, its ping, uptime, where it is running, and a link to GitHub.

#### invite
> `!invite`

Returns the invite link of the discord server.

#### ping
> `!ping`

Returns the current ping of the bot.

#### help
> `!help <command>`

Sends the user a DM with help information a command, or on every command, if no command is provided.

**example:**
> `!help menu`

**arguments:**
> `<command>` - any of the bots commands (optional)


### Admin
#### setinvite
> `!setinvite <invite link>`

Sets the server's invite link to the specified URL. This is the link that is returned by the `invite` command.
#### sendmessage
> `!sendmessage <channel> <content>`

Sends a message with the supplied content to a channel. Can also send an embed, if it is attached as a JSON file. In this case, content is optional.

#### editmessage
> `!editmessage <channel> <message> <content>`

Edits a message with the supplied content. Can also edit an embed, if it is attached as a JSON file. If only one of the two should be edited, the other one has to be provided without a change. (otherwise, it is deleted)

#### autoreact
> `!autoreact <channel> <media-only> <emoji...>`

Sets up an autoreact channel, where the supplied emojis are added as a reaction to every message. If media-only is set to true, the bot only reacts to messages containing attachments and URLs.

#### autoexec
> `!autoexec <channel> <type> <cron> <content>`

Creates an autoexec task in the supplied channel. It is executed after the cron pattern. Currently, only the type menu is supported. Content specifies additional content of the sent message.

#### reactionrole
> `!reactionrole <channel> <message> <role> <emoji>`

Instantiates a new reactionrole, that gives the user a role when they react to the message with the emoji.
