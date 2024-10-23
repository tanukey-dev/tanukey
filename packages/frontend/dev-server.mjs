import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();

app.get("/vue/*", serveStatic({ root: "./dist/" }));
app.get("*", serveStatic({ path: "./dist/index.html" }));

serve(
	{
		fetch: app.fetch,
		port: 8080,
	},
	(info) => {
		console.log(`Listening on http://localhost:${info.port}`); // Listening on http://localhost:3000
	},
);
