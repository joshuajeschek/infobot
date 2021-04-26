import { Schema, model } from 'mongoose';

const req_string = {
    type: String,
    required: true,
};

const schema = new Schema({
    guild_id: req_string,
    channel_id: req_string,
    type: req_string,
    cron_expression: req_string,
    msg_content: String,
});

export const autoExecSchema = model('autoexecs', schema);
