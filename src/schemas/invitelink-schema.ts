import { Schema, model } from 'mongoose';

const schema = new Schema({
    guild_id: {
        type: String,
        required: true,
    },
    invite_link: {
        type: String,
        required: true,
    },
});

export const inviteLinkSchema = model('invitelinks', schema);
