import esbuild from "rollup-plugin-esbuild";
import dts from "rollup-plugin-dts";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";

const plugins = [
    esbuild(),
];

let input = "src/lib/index.ts";
let outputDir = "dist";

if (process.env.TARGET === "demo") {
    input = "src/demo/index.ts";
    outputDir = "demo/js";

    if (process.env.NODE_ENV === "dev") {
        plugins.push(livereload({
            watch: "demo",
        }));
        plugins.push(serve({
            open: false,
            port: 9081,
            contentBase: "demo",
        }));
    }
}

export default [{
    input,
    output: {
        dir: outputDir,
        format: "es",
    },
    plugins,
}, {
    input,
    output: {
        dir: outputDir,
        format: "es",
    },
    plugins: [dts()],
}];
