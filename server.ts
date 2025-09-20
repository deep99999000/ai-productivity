import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number(process.env.PORT) || 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  // Derive allowed origin for production
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || vercelUrl;

  const io = new Server(httpServer, {
    cors: {
      origin: dev ? `http://localhost:${port}` : siteUrl || true,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join a chat room
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`Client ${socket.id} joined room: ${roomId}`);
    });

    // Handle new messages
    socket.on("send-message", ({ roomId, message }) => {
      // Broadcast to all clients in the room (including sender)
      io.to(roomId).emit("new-message", message);
      console.log(`Message sent to room ${roomId}:`, message);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      if (!dev && siteUrl) {
        console.log(`CORS origin set to: ${siteUrl}`);
      }
    });
});
