// lib/socket.ts
"use client";

import { io, Socket } from "socket.io-client";

const URL =
  //  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

export const socket: Socket = io(URL, {
  autoConnect: true,
  transports: ["websocket"],
  reconnectionAttempts: 5,
  reconnectionDelay: 5000,
});
