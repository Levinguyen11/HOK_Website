import express, { Response } from 'express'
// const server = require("http").createServer(app);
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()

const httpSever = createServer(app)

const io = new Server(httpSever, {})

io.on('connection', function (socket) {
  socket.on('join', function (data) {
    socket.join(data.roomId)
    // socket.room = data.roomId
    const sockets = io.of('/').in(data.roomId).adapter.rooms[data.roomId]
    if (sockets.length === 1) {
      socket.emit('init')
    } else {
      if (sockets.length === 2) {
        io.to(data.roomId).emit('ready')
      } else {
        socket.rooms = null
        socket.leave(data.roomId)
        socket.emit('full')
      }
    }
  })
  socket.on('signal', (data) => {
    io.to(data.room).emit('desc', data.desc)
  })
  socket.on('disconnect', () => {
    const roomId = Object.keys(socket.adapter.rooms)[0]
    if (socket.room) {
      io.to(socket.room).emit('disconnected')
    }
  })
})

httpSever.listen(8080, () => console.log(`Server is started`))
