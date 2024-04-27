import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

import { Server } from "socket.io";

const webSocketServer = {
  name: "websocket",
  configureServer(server) {
    if (!server.httpServer) return;

    const io = new Server(server.httpServer);

    io.on("connection", (socket) => {
      socket.on("newData", (projectId) => {
        io.emit("fetchNewData", projectId);
      });

      console.log("connected: ", socket.id);
      socket.emit("eventFromServer", "✅ Connected");
    });
  },
};

export default defineConfig({
  plugins: [sveltekit(), webSocketServer],
});
