const { Server } = require('socket.io')
const io = new Server(8000, {
    cors: {
        origin: "http://pair-programming-b5znht7yl-kartikgupta666s-projects.vercel.app", // Replace with your frontend URL
        methods: ["GET", "POST"],
        credentials: true
    }
});
const emailtosocketidMap = new Map();
const socketidtoemailMap = new Map();
io.on("connection", (socket) => {
    // console.log("Socket connected" + socket.id)
    socket.on("room:join", (data) => {
        const { email, room } = data;

        emailtosocketidMap.set(email, socket.id)
        socketidtoemailMap.set(socket.id, email)

        io.to(room).emit("user:joined", { email, id: socket.id })
        socket.join(room)
        io.to(socket.id).emit("room:join", data)
        // web call (video call)
        socket.on("user:call", ({ to, offer }) => {
            io.to(to).emit("incoming:call", { from: socket.id, offer })
        })
        socket.on("call:accepted", ({ to, ans }) => {
            io.to(to).emit("call:accepted", { from: socket.id, ans })
        })
        socket.on("peer:nego:needed", ({ to, offer }) => {
            // console.log("peer:nego:needed", offer)
            io.to(to).emit("peer:nego:needed", { from: socket.id, offer })
        })
        socket.on("peer:nego:done", ({ to, ans }) => {
            // console.log("peer:nego:done", ans)
            io.to(to).emit("peer:nego:final", { from: socket.id, ans })
        })
        socket.on("editorChange", ({ id, value }) => {
            // console.log("editorChange", id, value)
            io.to(id).emit("editorChange", value);
        })
        socket.on('disconnect', () => {
            // console.log("client disconnected", socket.id)
            const email = socketidtoemailMap.get(socket.id);
            emailtosocketidMap.delete(email);
            socketidtoemailMap.delete(socket.id);
        })
    })
})