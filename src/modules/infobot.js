'use strict';
const path = require('path');
const Commando = require('discord.js-commando');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

module.exports = class InfoBot extends Commando.Client {
    constructor(options) {
        super(options);
        this.commandoSetup();
        this.discordListeners();
    }

    commandoSetup() {
        this.registry
            .registerGroups([
                ['util', 'Utility'],
            ])
            .registerDefaults()
            .registerCommandsIn(path.join(__dirname, '../commands'));

        console.log('💬 Loaded these commands:\n', this.registry.commands.keys());

        this.setProvider(
            sqlite.open({ filename: 'database.db', driver: sqlite3.Database }).then(db => new Commando.SQLiteProvider(db)),
        ).catch(console.error);
    }

    discordListeners() {
        this.once('ready', () => {
            console.log(`✅ Logged in as ${this.user.tag}`);
            this.user.setActivity('Prefix: !', {
                type: 'WATCHING',
            });
        });
    }
};
