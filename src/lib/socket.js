import { io } from "socket.io-client";

export const socket = io();

socket.on("eventFromServer", (message) => {
  console.log(message); // will log '✅ Connected';
});
