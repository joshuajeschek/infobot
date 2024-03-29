import ArchivableCommand from './admin/archivable';
import AutoExecCommand from './admin/autoexec';
import AutoReactCommand from './admin/autoreact';
import EditMessageCommand from './admin/editmessage';
import ReactionRoleCommand from './admin/reactionrole';
import SendMessageCommand from './admin/sendmessage';
import SetInviteCommand from './admin/setinvite';
import SettingsCommand from './admin/settings';
import TranslatableCommand from './admin/translatable';
import TextChannelCommand from './channels/textchannel';
import VoiceChannelCommand from './channels/voicechannel';
import MenuCommand from './mensa/menu';
import InviteCommand from './util/invite';
import StatusCommand from './util/status';

export const groups = [
    ['util', 'Utility'],
    ['admin', 'Administration'],
    ['mensa', 'Mensa'],
    ['channels', 'Channels'],
];

export const commands = [
    InviteCommand,
    SetInviteCommand,
    StatusCommand,
    MenuCommand,
    SendMessageCommand,
    EditMessageCommand,
    AutoReactCommand,
    AutoExecCommand,
    ReactionRoleCommand,
    SettingsCommand,
    VoiceChannelCommand,
    TextChannelCommand,
    ArchivableCommand,
    TranslatableCommand,
];
