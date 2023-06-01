import { Server } from 'node-osc';

const oscServer = new Server(7000, '0.0.0.0', () => {
  console.log('OSC Server is listening');
});

oscServer.on('message', function (msg) {
    if(msg[0] !== 'Head') return false;
    // console.log(msg);
//   console.log(`Message: ${msg}`);
//   oscServer.close();
});