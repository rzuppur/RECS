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

let input = "src/engine/index.ts";

if (process.env.NODE_ENV === "dev") {
    input = "src/demo/index.ts";

    plugins.push(livereload({
        watch: "dist",
    }));
    plugins.push(serve({
        open: false,
        port: 9081,
    }));
}

export default {
    input,
    output: {
        dir: "dist",
        format: "es",
        plugins: process.env.NODE_ENV === "dev" ? [] : [esbuild({ minify: true })],
    },
    plugins,
};
