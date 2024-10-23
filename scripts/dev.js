const execa = require("execa");
const fs = require("fs");

(async () => {
	await execa("pnpm", ["clean"], {
		cwd: __dirname + "/../",
		stdout: process.stdout,
		stderr: process.stderr,
	});

	await execa("pnpm", ["build-pre"], {
		cwd: __dirname + "/../",
		stdout: process.stdout,
		stderr: process.stderr,
	});

	execa("pnpm", ["exec", "gulp", "watch"], {
		cwd: __dirname + "/../",
		stdout: process.stdout,
		stderr: process.stderr,
	});

	execa("pnpm", ["--filter", "backend", "watch"], {
		cwd: __dirname + "/../",
		stdout: process.stdout,
		stderr: process.stderr,
	});

	execa("pnpm", ["--filter", "sw", "watch"], {
		cwd: __dirname + "/../",
		stdout: process.stdout,
		stderr: process.stderr,
	});

	const start = async () => {
		try {
			const stat = fs.statSync(
				__dirname + "/../packages/backend/built/boot/index.js",
			);
			if (!stat) throw new Error("not exist yet");
			if (stat.size === 0) throw new Error("not built yet");

			const subprocess = await execa("pnpm", ["start"], {
				cwd: __dirname + "/../",
				stdout: process.stdout,
				stderr: process.stderr,
			});

			// なぜかworkerだけが終了してmasterが残るのでその対策
			process.on("SIGINT", () => {
				subprocess.kill("SIGINT");
				process.exit(0);
			});
		} catch (e) {
			await new Promise((resolve) => setTimeout(resolve, 3000));
			start();
		}
	};

	start();
})();
