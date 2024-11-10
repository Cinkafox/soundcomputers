import path from 'path';
import fs from 'fs';
import { convertMP3UrlToDFPWM } from './convert.js';
import { fileURLToPath } from 'url';
import express from 'express';
import SoundCommand from './types/SoundCommand.js';

const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let currCommand = new SoundCommand("","", true);

const outputDir = path.resolve(__dirname, 'converted_files');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Endpoint to start the conversion
app.post('/convert', async (req, res) => {
    const { mp3Url } = req.body;
    const dateNow = Date.now();
    if (!mp3Url) return res.status(400).send('MP3 URL is required');
  
    try {
      const outputPath = path.join(outputDir, `output-${dateNow}.dfpwm`);
      await convertMP3UrlToDFPWM(mp3Url, outputPath);
      res.json({ message: 'Conversion successful!', filePath: path.basename(outputPath) });
    } catch (error) {
      res.status(500).json({ error: 'Conversion failed', details: error.message });
    }
  });
  
  // Endpoint to list converted files
  app.get('/files', (req, res) => {
    const files = fs.readdirSync(outputDir).map(file => ({
      name: file,
      url: `/converted_files/${file}`
    }));
    res.json(files);
  });
  
  // Serve converted files
  app.use('/converted_files', express.static(outputDir));

  app.get('/control',(req,res)=>{
    if(req.query.clear === "true"){
      res.json({clear:true})
      currCommand = new SoundCommand("","", true);
      return;
    }
    let path = req.query.path;
    
    if(path == undefined){
      res.json(currCommand);
      return;
    }
    currCommand = new SoundCommand(path, Date.now(), false);
    res.json({"pasted": path})
  })

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
