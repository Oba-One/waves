import dotenv from "dotenv";
import session from "@fastify/session";

dotenv.config();

import { router } from "./router";
import { server } from "./server";

const IS_GOOGLE_CLOUD_RUN = process.env.K_SERVICE !== undefined;
const host = IS_GOOGLE_CLOUD_RUN ? "0.0.0.0" : undefined;
const port = Number(process.env.PORT) || 3000;

// Middleware
server.register(require("@fastify/cors"), { origin: "*" }); // Adjust the "origin" option as needed
server.register(require("@fastify/helmet"));
server.register(require("@fastify/sensible"));
server.register(require("@fastify/cookie"));
server.register(session, {
  secret: `${process.env.SESSION_SECRET ?? "issa a secret with minimum length of 32 characters"}}`,
  saveUninitialized: true,
  cookieName: "waves_cookie",
  cookie: {
    maxAge: 86400000, // 1 day
    httpOnly: true,
  },
});

// Router
server.register(router);

server.get("/status", async function (_req, reply) {
  reply.send({ status: "ok" });
});

server.listen({ port, host });

export default server;

console.log(`🚀  WAVES API server running at https://localhost:${port}/status`);
