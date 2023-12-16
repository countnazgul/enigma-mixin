import typescript from "@rollup/plugin-typescript";
import del from "rollup-plugin-delete";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json"));
// import dts from "rollup-plugin-dts";

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "es",
      sourcemap: true,
    },
    ,
    {
      file: pkg.module,
      format: "es",
      exports: "named",
      sourcemap: true,
    },
  ],
  external: [
    // ...Object.keys(pkg.dependencies || {}),
    // ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    json(),
    del({
      targets: "dist/*",
    }),
    typescript(),
    // dts(),
  ],
};
