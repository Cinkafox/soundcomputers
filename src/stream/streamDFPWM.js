import { PassThrough } from 'stream';
import ffmpeg from "fluent-ffmpeg";
import { StreamOutput } from '@dank074/fluent-ffmpeg-multistream-ts';
import StreamBuffer from '../types/StreamBuffer';

/**
 * 
 * @param {*} input 
 * @param {[string]} options 
 * @returns {Promise<StreamBuffer>}
 */
export default function (input, options = []){
    return new Promise((resolve, reject) => {
        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.3",
            "Connection": "keep-alive"
        }

        let command;

        let isHttpUrl = false;
        let isHls = false;

        if(typeof input === "string")
        {
            isHttpUrl = input.startsWith('http') || input.startsWith('https');
            isHls = input.includes('m3u');
        }

        try {
            const tunnel = new PassThrough()

            command = ffmpeg(input)
            .addOption('-loglevel', '0')
            .addOption('-fflags', 'nobuffer')
            .addOption('-analyzeduration', '0')
            .on('end', () => {
                command = undefined;
            })
            .on("error", (err, stdout, stderr) => {
                command = undefined;
                reject('cannot play audio ' + err.message + " " + stdout + " " + stderr)
            })
            .on('stderr', console.error)
            .audioCodec('pcm_s16le')
            .format('wav')
            .output(StreamOutput(tunnel).url)
            .noVideo()
            .audioChannels(2)
            .audioFrequency(48000);

            if(isHttpUrl) {
                command.inputOption('-headers', 
                    Object.keys(headers).map(key => key + ": " + headers[key]).join("\r\n")
                );
                if(!isHls) {
                    command.inputOptions([
                        '-reconnect 1',
                        '-reconnect_delay_max 4294'
                    ]);
                }
            }

            command.addOptions(options)
            command.run();

            resolve(new StreamBuffer(tunnel))
            
        } catch(e) {
            command = undefined;
            reject("cannot convert audio " + e.message);
        }
    })
}