

const express = require('express')
const { createServer } = require('http')
const app = express()
require('dotenv').config()
const server = createServer(app)
const socket = require("socket.io")
const io = socket(server, {
    cors: process.env.Host
})

app.get('/', (req, res) => {
    res.send("HEllo")
})

const EmailToSocket = new Map()
const ScoketToEmail = new Map()
io.on("connection", (socket) => {
    console.log("User Connected")

    socket.on('join-room', (data) => {
        const { email, roomid } = data
        EmailToSocket.set(email, socket.id)
        ScoketToEmail.set(socket.id, email)
        socket.join(roomid)
        socket.emit('joined-room', roomid)
        socket.broadcast.to(roomid).emit('user-joined', email)
    })

    socket.on('call-user', (data) => {
        const { to, offer } = data
        console.log("Calling user", to)
        const socketid = EmailToSocket.get(to)
        const email = ScoketToEmail.get(socket.id)
        socket.to(socketid).emit('incoming-call', { from: email, offer })
        console.log(email)
    })

    socket.on('Call-Accepted', (data) => {
        const { from, Ans } = data
        const socketid = EmailToSocket.get(from)
        socket.to(socketid).emit("Accepted", Ans)
    })

    socket.on('negotiated_offer', ({ to, offer }) => {
        const socketid = EmailToSocket.get(to)
        const email = ScoketToEmail.get(socket.id)
        socket.to(socketid).emit('incomming_negotiation', { from: email, offer })
    })
    socket.on('negotiation_done', ({ from, Ans }) => {
        const socketid = EmailToSocket.get(from)
        socket.to(socketid).emit('negotiated', { Ans })
    })
})
server.listen(8000, () => {
    console.log("Server was Started")
})