import { WebSocket,WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface User{
    socket: WebSocket;
    room:string;
    username:string;
}

let allSockets: User[] = [];

wss.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("message", (message) => {
        const parsedMessage = JSON.parse(message.toString());

        if (parsedMessage.type === "join") {
            allSockets.push({
                socket,
                room: parsedMessage.payload.roomId,
                username: parsedMessage.payload.username,
            });

            console.log(`${parsedMessage.payload.username} joined room ${parsedMessage.payload.roomId}`);

            // ✅ Optional: send acknowledgment to the client
            socket.send(JSON.stringify({
                type: "system",
                payload: { message: "You joined the chat!" }
            }));
        }

        if (parsedMessage.type === "chat") {
            const currentUser = allSockets.find((x) => x.socket === socket);
            const currentUserRoom = currentUser?.room;

            if (!currentUserRoom) return;

            allSockets.forEach((s) => {
                if (s.room === currentUserRoom && s.socket !== socket) {
                    s.socket.send(JSON.stringify({
                        type: "chat",
                        payload: {
                            message: parsedMessage.payload.message,
                            username: parsedMessage.payload.username,
                        },
                    }));
                }
            });
        }
    });

    // ✅ Handle client disconnect
    socket.on("close", () => {
        console.log("Client disconnected");
        allSockets = allSockets.filter((u) => u.socket !== socket);
    });

    // ✅ Optional: handle errors to avoid crashing
    socket.on("error", (err) => {
        console.error("Socket error:", err.message);
    });
});

   
// });
