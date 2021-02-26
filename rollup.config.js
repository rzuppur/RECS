import ts from "@wessberg/rollup-plugin-ts";
import {terser} from "rollup-plugin-terser";
import {nodeResolve} from "@rollup/plugin-node-resolve";

const plugins = [
    ts(),
    nodeResolve(),
]

export default {
    input: "src/engine/index.ts",
    output: {
        dir: "dist",
        format: "cjs",
        plugins: [terser()],
    },
    plugins,
};
