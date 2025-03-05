# Overview
- Example of Pear desktop app with Javascript + React + Hyperswarm + Corestore
- Multiple app instances can run concurrently (same machine or different machines) 
to connect and replicate messages

# Getting started
## Prod mode
```shell
npm i
npm run build
npm start
```

## Dev mode
```shell
npm i
npm run dev
```

# Run
- Open two apps, e.g. run `npm run dev` in two terminals
- On the first app, 
  - click Start writer
  - wait for core created with a core key
- On the second app
  - copy the above core key into the reader input box
  - click Start reader
  - wait for started
- Go back to first app, send a message, the second app will receive it
