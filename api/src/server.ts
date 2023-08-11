import fs from "fs";
import path from "path";
import fastify from "fastify";

declare module "fastify" {
  export interface Session {
    nonce?: string;
    currentChallenge?: string;
    address?: string;
  }
}

const useHttps = process.env.NODE_ENV === "development";

const httpsOptions = {
  http2: useHttps,
  https: useHttps
    ? {
        allowHTTP1: true,
        key: fs.readFileSync(path.join(__dirname, "../cert/fastify.key")),
        cert: fs.readFileSync(path.join(__dirname, "../cert/fastify.cert")),
      }
    : undefined,
};

export const server = fastify({
  trustProxy: true,
  bodyLimit: 1048576 * 7,
  logger: !!(process.env.NODE_ENV !== "development"),
  ...httpsOptions,
});
