import * as esbuild from "esbuild";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { htmlPlugin } from "@jgoz/esbuild-plugin-html";
import { rm } from "fs/promises";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = __dirname;
const isDevMode = process.argv.includes("dev");

const aliases = {
	"@animman/tma": path.resolve(rootDir, "../../apps/tma/src"),
	"@animman/server": path.resolve(rootDir, "../../apps/server/src"),
	"@animman/bot": path.resolve(rootDir, "../../apps/bot/src"),
	"@animman/shared": path.resolve(rootDir, "../../apps/packages/shared/src"),
	"@animman/config": path.resolve(rootDir, "../../apps/packages/config/src")
};

const buildOption: esbuild.BuildOptions = {
	entryPoints: [`${rootDir}/src/index.tsx`],
	outdir: `${rootDir}/dist`,
	bundle: true,
	...(isDevMode
		? { sourcemap: "inline" }
		: { minify: true, sourcemap: "external" }),
	metafile: true,
	absWorkingDir: rootDir,
	entryNames: "[name]-[hash]",
	chunkNames: `chunks/[name]-[hash]`,
	assetNames: `assets/[name]-[hash]`,
	alias: aliases,
	logLevel: "info",
	plugins: [
		htmlPlugin({
			template: path.join(rootDir, "index.html"),
			defer: true
		})
	],
	loader: {
		".jpg": "file",
		".svg": "file"
	}
};

async function build() {
	await rm(`${rootDir}/dist`, { recursive: true, force: true });
	if (!isDevMode) {
		await esbuild.build(buildOption);
		return;
	}

	const ctx = await esbuild.context(buildOption);
	await ctx.serve({
		servedir: `${rootDir}/dist`
	});
	await ctx.watch();
}

build().catch(err => console.log(err));
