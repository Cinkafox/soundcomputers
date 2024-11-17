import path from 'path';
import express from 'express';
import WebSocket from "ws"
import { fileURLToPath } from 'url';
import streamDFPWM from './src/stream/streamDFPWM';
import StreamBuffer from './src/types/StreamBuffer';

const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

/**
 * @type {StreamBuffer}
 */
let sb;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/load', async (req, res) => {
    console.log(req.query.path)
    sb = await streamDFPWM(req.query.path, [])
    res.send("well")
});

var server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

var ws = new WebSocket.Server({server})

ws.on("connection",(e)=>{
  console.log("Connected another client!")
  e.send("Hello!")
  e.on("message",(m)=>{
    
  })
  e.on('close',(code,reason)=>{
    console.log("Disconected client " + code + " " + reason)
  })
})