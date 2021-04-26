import { Schema, model } from 'mongoose';

const req_string = {
    type: String,
    required: true,
};

const schema = new Schema({
    guild_id: req_string,
    channel_id: req_string,
    media_only: {
        type: Boolean,
        required: true,
    },
    emojis: [req_string],
});

export const autoReactChannelSchema = model('autoreactchannels', schema);
