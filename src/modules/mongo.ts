import mongoose from 'mongoose';
import { exit } from 'process';

let mongo_url: string;

export async function mongo(): Promise<typeof mongoose> {
    if (!mongo_url) {
        mongo_url = compileMongoUrl()[0];
    }
    await mongoose.connect(mongo_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });
    return mongoose;
}

export function compileMongoUrl(): string[] {
    const env = process.argv[2];

    let url = `mongodb://<user>:${process.env.MONGO_PW}@${process.env.MONGO_IP}:27017/<user>`;
    switch (env) {
    // dev
    case 'D':
        url = url.split('<user>').join('infobot-dev');
        return [ url, 'infobot-dev' ];

    // prod
    case 'P':
        url = url.split('<user>').join('infobot-prod');
        return [ url, 'infobot-prod' ];

    default:
        console.log(`Invalid app provided. [${process.argv[2]}`);
        exit(1);
    }
}
