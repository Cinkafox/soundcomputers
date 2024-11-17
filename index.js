import path from 'path';
import express from 'express';
import WebSocket from "ws"
import { fileURLToPath } from 'url';
import streamDFPWM from './src/stream/streamDFPWM.js';

const PORT = 3000;
const delay = ms => new Promise(res => setTimeout(res, ms));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const ws = new WebSocket.Server({server});

let encoder;

ws.on("connection",(client)=>{
  console.log("Connected another client!")
  client.on('close',(code,reason)=>{
    console.log("Disconected client " + code + " " + reason)
  })
})

function sendAll(data){
  ws.clients.forEach(socket => {
    socket.send(data)
  });
}

let buffer = [];
let isEmpty = true;

function clear(){
  encoder?.command?.kill();
  buffer = [];
  isEmpty = true;
}

async function playChunk(){
  let content;
  while((content = buffer.shift()) != undefined){
    let chunk = content[1];
    let duration = content[0] * 1000 - 10;
    
    sendAll(chunk);
    await delay(duration)
  }
  console.log("done")
  isEmpty = true;
}

async function playMusic(data) {
  if(data === undefined) 
    return;

  encoder = await streamDFPWM(data, []);
  playStream(encoder);
}

async function playStream(stream) {
  stream.on("data",(chunk)=>{
    var duration = chunk.length * 8 / 48000;

    buffer.push([duration, chunk]);

    if(isEmpty){
      playChunk();
      isEmpty = !isEmpty
    }
  })
}

app.post('/load', async (req, res) => {
  const { url } = req.body;
  try{
    clear();
    await playMusic(url)
    res.send({status:"ok"});
  }catch(e){
    res.status(500).send({status:"error",error: e});
  }
});

app.get('/stop', (req,res)=>{
  try{
    clear();
    res.send({status:"ok"});
  }catch(e){
    res.status(500).send({status:"error",error: e});
  }
})