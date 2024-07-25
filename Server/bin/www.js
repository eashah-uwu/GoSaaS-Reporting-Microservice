#!/usr/bin/env node

const app = require('../app');
const debug = require('debug')('my-express-backend:server');
const http = require('http');
const config = require('config');


const port = normalizePort(config.get('server.port'));
app.set('port', port);

const server = http.createServer(app);

server.listen(port);
server.on('listening', onListening);

function normalizePort(val) {
    const port = parseInt(val, 10);
  
    if (isNaN(port)) {
      return val;
    }
  
    if (port >= 0) {
      return port;
    }
  
    return false;
}


  function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debug('Listening on ' + bind);
  }