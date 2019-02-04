import resolve from 'rollup-plugin-node-resolve';
import nodeBuiltins from 'rollup-plugin-node-builtins';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import filesize from 'rollup-plugin-filesize';
import license from 'rollup-plugin-license';
import { terser } from "rollup-plugin-terser";
import extend from 'extend';

const pkg = require('./package.json');

const createConfig = (overrides) => {
    const config = {
        output: {
            format: 'umd',
            sourcemap: true,
        },
        plugins: [
            resolve({ jsnext: true, preferBuiltins: false }),
            nodeBuiltins(),
            commonjs(),
            babel({
                exclude: 'node_modules/**',
                externalHelpers: true,
            }),
            license({
                banner: `
              ${pkg.name} v${pkg.version}
              Copyright (c) ${new Date().getFullYear()} Stefan Stoichev
              This library is licensed under MIT - See the LICENSE file for full details
            `,
            }),
            filesize(),
        ],
    };
    extend(true, config, overrides);
    if (process.env.NODE_ENV === 'production') {
        config.output.file = config.output.file.replace('.js', '.min.js');
        config.plugins.push(terser());
    }
    return config;
};

const build = createConfig({
    input: 'src/main.js',
    output: {
        file: 'dist/enigma-mixin.js',
        name: 'enigma-mixin',
    },
});

export default [build];