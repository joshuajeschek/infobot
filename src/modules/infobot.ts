import { Client, CommandoClientOptions, FriendlyError } from 'discord.js-commando';
import { exit } from 'process';
import { MongoClient } from 'mongodb';
import { MongoDBProvider } from 'commando-provider-mongo';
import { compileMongoUrl } from './mongo';

/* COMMANDS */
import { commands, groups } from './../commands/commands';
import { refreshAutoReactors } from './autoreactmanager';
import { refreshAutoExecs } from './autoexecmanager';
import { refreshReactionRoles } from './reactionroles/reactionrolemanager';
import { startTranslatableManager } from './translatablemanager';
import { refreshArchivables } from './archivables/archivablemanager';

export default class InfoBot extends Client {
    constructor(options: CommandoClientOptions) {
        super(options);
        this.commandoSetup();
        this.discordListeners();

        if (process.argv.length < 2) {
            console.log('Please specify an application [H/T]');
            exit(1);
        }
        else if (process.argv[2] == 'P') {
            console.log('Logging in as informatik.bot');
            this.login(process.env.PROD_TOKEN);
        }
        else if (process.argv[2] == 'D') {
            console.log('Logging in as Chester McTester');
            this.login(process.env.DEV_TOKEN);
        }
        else {
            console.log(`Invalid app provided. [${process.argv[2]}`);
            exit(1);
        }
    }

    private async refresh() {
        await refreshAutoReactors(this);
        await refreshAutoExecs(this);
        await refreshReactionRoles(this);
        await refreshArchivables(this);
    }

    private commandoSetup(): void {
        this.registry
            .registerGroups(groups)
            .registerDefaultTypes()
            .registerDefaultGroups()
            .registerDefaultCommands({
                unknownCommand: false,
            })
            .registerCommands(commands);

        console.log('💬 Loaded these commands:\n', this.registry.commands.keys());

        const [ mongo_url, db_name ] = compileMongoUrl();
        this.setProvider(
            MongoClient.connect(mongo_url, { useUnifiedTopology: true }).then(
                (client) => new MongoDBProvider(client, db_name),
            ),
        ).catch(console.error);
    }

    private discordListeners(): void {
        this.once('ready', () => {
            console.log(`✅ Logged in as ${this.user?.tag}`);
            this.user?.setActivity('Prefix: !', {
                type: 'WATCHING',
            });
            this.refresh();
            startTranslatableManager(this);
        });

        /* Friendly Error Logging */
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.on('commandError', (cmd, err, _, __, ___) => {
            if (err instanceof FriendlyError) return;
            console.error(`💬 Error in command ${cmd.groupID}:${cmd.memberName}`, err);
        });
    }
}
