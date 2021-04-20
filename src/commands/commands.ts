import SetInviteCommand from './admin/setinvite';
import MenuCommand from './mensa/menu';
import InviteCommand from './util/invite';
import StatusCommand from './util/status';

export const groups = [
    ['util', 'Utility'],
    ['admin', 'Administration'],
    ['mensa', 'Mensa'],
];

export const commands = [
    InviteCommand,
    SetInviteCommand,
    StatusCommand,
    MenuCommand,
];
