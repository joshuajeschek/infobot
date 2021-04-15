import { Client, SQLiteProvider, CommandoClientOptions } from 'discord.js-commando';
import { open } from 'sqlite';
import { Database } from 'sqlite3';
import InviteCommand from './../commands/util/invite';


export default class InfoBot extends Client {
    constructor(options: CommandoClientOptions) {
        super(options);
        this.commandoSetup();
        this.discordListeners();
    }

    private commandoSetup(): void {
        this.registry
            .registerGroups([
                ['util', 'Utility'],
            ])
            .registerDefaults()
            .registerCommands([
                InviteCommand,
            ]);

        console.log('💬 Loaded these commands:\n', this.registry.commands.keys());

        this.setProvider(
            open({ filename: 'database.db', driver: Database }).then(db => new SQLiteProvider(db)),
        ).catch(console.error);
    }

    private discordListeners(): void {
        this.once('ready', () => {
            if (this.user) {
                console.log(`✅ Logged in as ${this.user.tag}`);
                this.user.setActivity('Prefix: !', {
                    type: 'WATCHING',
                });
            }
        });
    }
}
