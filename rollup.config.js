import ts from "@wessberg/rollup-plugin-ts";
import esbuild from "rollup-plugin-esbuild";
import replace from "@rollup/plugin-replace";
import {nodeResolve} from "@rollup/plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import serve from "rollup-plugin-serve";

const plugins = [
    ts(),
    nodeResolve(),
    replace({
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    }),
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
    } else {
        plugins.push(esbuild());
    }
} else {
    plugins.push(esbuild({minify: true}));
}

export default {
    input,
    output: {
        dir: outputDir,
        format: "es",
    },
    plugins,
};
