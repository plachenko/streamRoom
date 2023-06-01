import { Server } from 'node-osc';
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
let ws;
wss.on('connection', function connection(_ws) {
    ws = _ws;
    ws.on('error', console.error);

    ws.on('message', function message(data) {
        console.log('yo');
        console.log('received: %s', data);
    });
});


const oscServer = new Server(7000, '0.0.0.0', () => {
    console.log('OSC Server is listening');
});

oscServer.on('message', function (msg) {
    // return false;
    if(msg[0] !== 'Head') return false;
    sendMsg(msg);
//   console.log(`Message: ${msg}`);
//   oscServer.close();
});

function sendMsg(data){
    ws?.send(JSON.stringify(data));
}
