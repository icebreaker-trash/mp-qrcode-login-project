
import http from 'http'
import express from 'express'
import router from './routers/index.js'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
app.use((cors({
  origin: 'http://localhost:3000'
})))

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000'
  }
})
app.use((req, res, next) => {
  req.io = io
  next()
})
app.use('/api/v1', router)
io.on('connection', (socket) => {
  console.log(`connect ${socket.id}`)

  socket.on('login', (params, cb) => {
    console.log('login', params)
    // cb()
    const t = io.sockets.sockets.get(params.id)// []
    if (t) {
      t.emit('success', params.userinfo)
    }
  })

  socket.on('ping', (cb) => {
    console.log('ping')
    cb()
  })

  socket.on('disconnect', () => {
    console.log(`disconnect ${socket.id}`)
  })
})
server.listen(9000)
