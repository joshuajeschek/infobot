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
    if (!env) {
        console.log(`Invalid app provided. [${process.argv[2]}`);
        exit(1);
    }

    let url = 'mongodb://localhost:27017/<database>';

    switch (env) {
    // dev
    case 'D':
        url = url.replace('<database>', 'infobot-dev');
        return [ url, 'infobot-dev' ];

    // prod
    case 'P':
        url = url.replace('<database>', 'infobot-prod');
        return [ url, 'infobot-prod' ];

    default:
        exit(1);
    }
}
