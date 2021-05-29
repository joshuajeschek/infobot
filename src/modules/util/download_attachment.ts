import { Message } from 'discord.js';
import { DownloaderHelper } from 'node-downloader-helper';

export async function downloadJSON(msg:Message):Promise<Record<string, unknown> | undefined> {
    const url = msg.attachments.first()?.url;
    const is_json = msg.attachments.first()?.name?.endsWith('.json');
    if (!url || !is_json) {
        return undefined;
    }

    const download = new DownloaderHelper(url, 'tmp', {
        override: true,
    });

    return new Promise((resolve) => {
        download.on('end', async () => {
            const json_path = download.getDownloadPath().replace('\\', '/');
            import('./../../../../' + json_path)
                .then(json => resolve(json))
                .catch((err) => {
                    console.error(err);
                    resolve(undefined);
                });
        });
        download.on('error', (err) => {
            console.log(err);
            resolve(undefined);
        });
        download.start();
    });
}

