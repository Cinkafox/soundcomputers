import path from 'path';
import express from 'express';
import WebSocket from "ws"
import { fileURLToPath } from 'url';
import streamDFPWM from './src/stream/streamDFPWM.js';

const PORT = 3000;

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

function clear(){
  encoder?.command?.kill();
}

async function playMusic(data) {
  if(data === undefined) 
    return;

  encoder = await streamDFPWM(data, []);
  playStream(encoder);
}

async function playStream(stream) {
  stream.on("data",(chunk)=>{
    sendAll(chunk)
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