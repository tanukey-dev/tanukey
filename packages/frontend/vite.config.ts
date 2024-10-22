import path from "path";
import pluginReplace from "@rollup/plugin-replace";
import pluginVue from "@vitejs/plugin-vue";
import { type UserConfig, defineConfig } from "vite";
// @ts-expect-error https://github.com/sxzz/unplugin-vue-macros/issues/257#issuecomment-1410752890
import ReactivityTransform from "@vue-macros/reactivity-transform/vite";

import locales from "../../locales";
import generateDTS from "../../locales/generateDTS";
import meta from "../../package.json";
import pluginUnwindCssModuleClassName from "./lib/rollup-plugin-unwind-css-module-class-name";
import pluginJson5 from "./vite.json5";

const extensions = [
	".ts",
	".tsx",
	".js",
	".jsx",
	".mjs",
	".json",
	".json5",
	".svg",
	".sass",
	".scss",
	".css",
	".vue",
];

const hash = (str: string, seed = 0): number => {
	let h1 = 0xdeadbeef ^ seed,
		h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}

	h1 =
		Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
		Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 =
		Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
		Math.imul(h1 ^ (h1 >>> 13), 3266489909);

	return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

const BASE62_DIGITS =
	"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
function toBase62(n: number): string {
	if (n === 0) {
		return "0";
	}
	let result = "";
	while (n > 0) {
		result = BASE62_DIGITS[n % BASE62_DIGITS.length] + result;
		n = Math.floor(n / BASE62_DIGITS.length);
	}

	return result;
}

export function getConfig(): UserConfig {
	return {
		base: "/",

		server: {
			port: 5173,
			proxy: {
				"/api": "http://localhost:3000/",
				"/api-doc": "http://localhost:3000/",
				"/api-json": "http://localhost:3000/",
				// Node Info
				"/nodeinfo": "http://localhost:3000/",
				// .well-known
				"/.well-known": "http://localhost:3000/",
				// Manifest
				"/manifest.json": "http://localhost:3000/",
				// robot.txt
				"/robots.txt": "http://localhost:3000/",
				// opensearch.xml
				"/opensearch.xml": "http://localhost:3000/",
				// url
				"/url": "http://localhost:3000/",
				// Stripe
				"/transaction/webhook": "http://localhost:3000/",
				// Emoji
				"/emoji": "http://localhost:3000/",
				// Avatar
				"/avatar": "http://localhost:3000/",
				"/identicon": "http://localhost:3000/",
				// E-mail
				"/verify-email": "http://localhost:3000/",
				// Service Worker
				"/sw.js": "http://localhost:3000/",
				// Websocket
				"/streaming": {
					target: "http://localhost:3000/",
					ws: true,
				},
				// File
				"/files": "http://localhost:3000/",
				"/proxy": "http://localhost:3000/",
				"/assets": "http://localhost:3000/",
				"/static-assets": "http://localhost:3000/",
				"/client-assets": "http://localhost:3000/",
				"/favicon.ico": "http://localhost:3000/",
				"/apple-touch-icon.png": "http://localhost:3000/",
				"/fluent-emoji": "http://localhost:3000/",
				"/twemoji": "http://localhost:3000/",
				"/twemoji-badge": "http://localhost:3000/",
				// Activity Pub
				"/inbox": "http://localhost:3000/",
				"/users": "http://localhost:3000/",
				"/notes": "http://localhost:3000/",
				"/@.*": "http://localhost:3000/",
				"/emojis": "http://localhost:3000/",
				"/likes": "http://localhost:3000/",
				"/follows": "http://localhost:3000/",
			},
		},

		plugins: [
			pluginVue({
				reactivityTransform: true,
			}),
			ReactivityTransform(),
			pluginUnwindCssModuleClassName(),
			pluginJson5(),
			...(process.env.NODE_ENV === "production"
				? [
						pluginReplace({
							preventAssignment: true,
							values: {
								"isChromatic()": JSON.stringify(false),
							},
						}),
					]
				: []),
			{
				name: "locale:generateDTS",
				buildStart: generateDTS,
			},
		],

		resolve: {
			extensions,
			alias: {
				"@/": __dirname + "/src/",
				"/client-assets/": __dirname + "/assets/",
				"/static-assets/": __dirname + "/../backend/assets/",
				"/fluent-emojis/": __dirname + "/../../fluent-emojis/dist/",
				"/fluent-emoji/": __dirname + "/../../fluent-emojis/dist/",
			},
		},

		css: {
			modules: {
				generateScopedName(name, filename, _css): string {
					const id = (
						path.relative(__dirname, filename.split("?")[0]) +
						"-" +
						name
					)
						.replace(/[\\\/\.\?&=]/g, "-")
						.replace(/(src-|vue-)/g, "");
					if (process.env.NODE_ENV === "production") {
						return "x" + toBase62(hash(id)).substring(0, 4);
					} else {
						return id;
					}
				},
			},
		},

		define: {
			_VERSION_: JSON.stringify(meta.version),
			_LANGS_: JSON.stringify(
				Object.entries(locales).map(([k, v]) => [k, v._lang_]),
			),
			_ENV_: JSON.stringify(process.env.NODE_ENV),
			_DEV_: process.env.NODE_ENV !== "production",
			_PERF_PREFIX_: JSON.stringify("Misskey:"),
			_DATA_TRANSFER_DRIVE_FILE_: JSON.stringify("mk_drive_file"),
			_DATA_TRANSFER_DRIVE_FOLDER_: JSON.stringify("mk_drive_folder"),
			_DATA_TRANSFER_DECK_COLUMN_: JSON.stringify("mk_deck_column"),
			__VUE_OPTIONS_API__: true,
			__VUE_PROD_DEVTOOLS__: false,
		},

		// https://vitejs.dev/guide/dep-pre-bundling.html#monorepos-and-linked-dependencies
		optimizeDeps: {
			include: ["misskey-js"],
		},

		build: {
			target: ["chrome108", "firefox109", "safari16"],
			manifest: "manifest.json",
			cssCodeSplit: true,
			assetsDir: ".",
			emptyOutDir: false,
			sourcemap: process.env.NODE_ENV === "development",
			reportCompressedSize: false,

			// https://vitejs.dev/guide/dep-pre-bundling.html#monorepos-and-linked-dependencies
			commonjsOptions: {
				include: [/misskey-js/, /node_modules/],
			},
		},

		worker: {
			format: "es",
		},

		test: {
			environment: "happy-dom",
			deps: {
				inline: [
					// XXX: misskey-dev/browser-image-resizer has no "type": "module"
					"browser-image-resizer",
				],
			},
		},
	};
}

const config = defineConfig(({ command, mode }) => getConfig());

export default config;
