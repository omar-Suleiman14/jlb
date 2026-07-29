import { Client } from 'colyseus.js';

async function test() {
  console.log("Connecting...");
  const client = new Client('ws://localhost:2567');
  
  console.log("Creating room...");
  const room = await client.create('game_room', { roomCode: 'TEST' });
  console.log("Room created:", room.roomId);
  
  console.log("Waiting 1 second...");
  await new Promise(r => setTimeout(r, 1000));
  
  console.log("Querying REST endpoint...");
  const fetch = require('node-fetch');
  const res = await fetch('http://localhost:2567/find-room/TEST');
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
  
  room.leave();
  process.exit(0);
}

test();
