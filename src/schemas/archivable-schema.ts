import { Schema, model } from 'mongoose';

const req_string = {
    type: String,
    required: true,
};

const schema = new Schema({
    guild_id: req_string,
    parent_id: req_string,
    channel_id: req_string,
    archive_msg_id: String,
    archived: {
        type: Boolean,
        required: true,
    },
});

export const archivableSchema = model('archivables', schema);
