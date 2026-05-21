import app from "./index";

declare const Bun: {
	serve(options: { port: number; fetch: typeof app.fetch }): {
		url: URL;
	};
};

const port = Number(process.env.PORT || "3000");
const server = Bun.serve({
	port,
	fetch: app.fetch,
});

console.log(`Server -> ${server.url}`);
