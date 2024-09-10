import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cron from "node-cron";

import { handler } from "./build/handler.js";
import { generateStats } from "./src/lib/server/generateStats.js";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();
const server = createServer(app);

const io = new Server(server);

io.on("connection", (socket) => {
  socket.on("joinProject", (projectId) => {
    socket.join(projectId);
  });
  socket.on("newData", (projectId) => {
    io.to(projectId).emit("fetchNewData", projectId);
  });
});

// Stats
generateStats();

cron.schedule("*/10 * * * *", () => {
  generateStats();
});

// SvelteKit should handle everything else using Express middleware
// https://github.com/sveltejs/kit/tree/master/packages/adapter-node#custom-server
app.use(handler);

server.listen(port, () => {
  console.log("http://localhost:" + port);
});
