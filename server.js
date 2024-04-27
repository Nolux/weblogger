import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

import { handler } from "./build/handler.js";
dotenv.config();

const port = process.env.PORT || 3000;
const app = express();
const server = createServer(app);

const io = new Server(server);

io.on("connection", (socket) => {
  socket.on("newData", (projectId) => {
    io.emit("fetchNewData", projectId);
  });

  console.log("connected: ", socket.id);
  socket.emit("eventFromServer", "✅ Connected");
});

// SvelteKit should handle everything else using Express middleware
// https://github.com/sveltejs/kit/tree/master/packages/adapter-node#custom-server
app.use(handler);

server.listen(port, () => {
  console.log("http://localhost:" + port);
});
