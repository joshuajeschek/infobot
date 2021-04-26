import { Schema, model } from 'mongoose';

const req_string = {
    type: String,
    required: true,
};

const schema = new Schema({
    guild_id: req_string,
    channel_id: req_string,
    message_id: req_string,
    role_id: req_string,
    emoji: req_string,
});

export const reactionRoleSchema = model('reactionroles', schema);
