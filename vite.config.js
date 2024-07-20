import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

import { Server } from "socket.io";

const webSocketServer = {
  name: "websocket",
  configureServer(server) {
    if (!server.httpServer) return;

    const io = new Server(server.httpServer);

    io.on("connection", (socket) => {
      socket.on("joinProject", (projectId) => {
        socket.join(projectId);
      });
      socket.on("newData", (projectId) => {
        io.to(projectId).emit("fetchNewData", projectId);
      });
    });
  },
};

export default defineConfig({
  plugins: [sveltekit(), webSocketServer],
});
