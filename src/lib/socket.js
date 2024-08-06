import { writable } from "svelte/store";
import { io } from "socket.io-client";

export const socketStatus = writable(false);

export const socket = io();

socket.on("connect", () => {
  console.log("Connected to socket server");
  socketStatus.set(true);
});

socket.on("disconnect", () => {
  console.log("Disconnected from socket server");
  socketStatus.set(false);
});
