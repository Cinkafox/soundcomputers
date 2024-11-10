import fetch from 'node-fetch';
import ffmpeg from 'fluent-ffmpeg';
import { Encoder } from './dfpwm/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.resolve(__dirname, `./temp/`);

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}


async function downloadMP3(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download MP3: ${response.statusText}`);
    
    const buffer = await response.buffer();
    const mp3Path = path.join(outputDir, `${Date.now()}`);
    
    fs.writeFileSync(mp3Path, buffer);
    return mp3Path;
  }
  
  // Convert MP3 to PCM and encode to DFPWM
  async function convertToDFPWM(mp3Path, outputPath) {
    return new Promise((resolve, reject) => {
      // Initialize DFPWM encoder
      const encoder = new Encoder();
      const output = fs.createWriteStream(outputPath);
  
      // Set up ffmpeg process to output raw PCM audio data
      ffmpeg(mp3Path)
        .inputOptions('-y')
        .audioCodec('pcm_s8')          // Set audio codec to 16-bit PCM
        .audioChannels(1)                 // Mono channel
        .audioFrequency(48000)            // 48 kHz sample rate
        .format('s8')                  // Set output format as raw PCM data
        .on('start', commandLine => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('error', (err) => {
          reject(new Error(`FFmpeg error: ${err.message}`));
        })
        .on('end', () => {
          output.end();
          resolve();
        })
        .pipe()
        .on('data', (chunk) => {
          // Encode PCM data to DFPWM and write it to the output
          const dfpwmBuffer = encoder.encode(chunk);
          output.write(dfpwmBuffer);
        });
    });
  }
  
  // Main function to handle the process
  async function convertMP3UrlToDFPWM(mp3Url, outputPath) {
    try {
      const mp3Path = await downloadMP3(mp3Url);
      await convertToDFPWM(mp3Path, outputPath);
      fs.unlinkSync(mp3Path); // Clean up the temporary MP3 file
      console.log(`Conversion complete. DFPWM file saved to ${outputPath}`);
    } catch (error) {
      console.error('Error:', error);
    }
  }

export {downloadMP3, convertMP3UrlToDFPWM, convertToDFPWM}