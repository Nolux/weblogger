import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { eventEmitter } from "/src/lib/event.js";

import { Server } from "socket.io";

const webSocketServer = {
  name: "websocket",
  configureServer(server) {
    if (!server.httpServer) return;

    const io = new Server(server.httpServer);

    io.on("connection", (socket) => {
      console.log("connected: ", socket.id);
      socket.emit("eventFromServer", "✅ Connected");
      eventEmitter.on("newLog", () => {
        console.log("Helloooo! first listener");
        socket.emit("eventFromServer", "event");
      });
    });
  },
};

export default defineConfig({
  plugins: [sveltekit(), webSocketServer],
});
