import * as esbuild from "esbuild";

await esbuild.build({
	entryPoints: ["./src/Test.jsx"],
	outfile: "./bundle.js",
	bundle: true,
	minify: true,
	sourcemap: true
});
