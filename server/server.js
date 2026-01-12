import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import http from 'http'
import Server from 'socket.io'



const app = express()

const server = http.createServer(app)

const io = new Server(server,{
    cors:{
        origin:"*"
    }
})
io.on("connection",(socket)=>{
    console.log("a new user connected",socket.id);
    
    socket.on("disconnect",()=>{
        console.log("user disconnected")
    })
})
app.use(cors({
    origin:"*"
}))
app.use(express.json())

const port = process.env.PORT || 3000;

app.get('/',(req,res)=>{
    console.log("server live......");
    
})

server.listen(port,()=>{
    console.log("serer workingggg");
    
})

