
Websocket Demultiplexer
=======================

This simple library handles the demultiplexing of requests/responces over a single websocket connection (or not).

The only prerequisite for the server is to be able to mark respoinces with a context value so the matchmaking can be performed. 

Usage
---

Below is an example code of how this can be used:

```javascript
const demux = require('websocket-demux')
const WebSocket = require('ws')

demux.init()

const ws = new WebSocket('wss://echo.websocket.org/', {
  origin: 'https://websocket.org'
})

ws.on('open', function open() {
  console.log('connected')
  demux.request(ws, { time: Date.now() }, (err, res)=>{
    if(err) {
      console.log('Error: ', err)
      return
    }

    console.log('Roundtrip: ', Date.now() - res.time)
  })
})

ws.on('close', function close() {
  console.log('disconnected')
  demux.socket_closed()
})

ws.on('message', function incoming(data) {
  if(demux.process_message(JSON.parse(data))){
    // The message was handled return
    return
  }

  // Do custom handling. Here we just print the message
  console.log(data)
})
```

There is also a promisified version that you can use if you fancy:

```javascript
let res = await demux.request_async(ws, { time: Date.now() })
console.log(res)
```

Installation
---
```
npm install --save websocket-demux
```

