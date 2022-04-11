import typescript from "rollup-plugin-typescript2";
import del from "rollup-plugin-delete";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import pkg from "./package.json";
// import dts from "rollup-plugin-dts";

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
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
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    commonjs(),
    json(),
    del({
      targets: "dist/*",
    }),
    typescript({
      typescript: require("typescript"),
    }),
    // dts(),
  ],
};
