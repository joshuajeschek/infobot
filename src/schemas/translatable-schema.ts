import { Schema, model } from 'mongoose';

const req_string = {
    type: String,
    required: true,
};

const schema = new Schema({
    message_id: req_string,
    content: String,
    embed: Object,
});

export const translatableSchema = model('translatables', schema);
