import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
    // browser-friendly UMD build
    input: 'src/main.ts',
    output: {
        sourcemap: true,
        name: 'RespStyleAttr',
        file: 'dev/js/rsa.dev.umd.js',
        format: 'umd'
    },
    plugins: [
        resolve(),   // so Rollup can find `ms`
        commonjs(),  // so Rollup can convert `ms` to an ES module
        typescript({sourceMap: true}) // so Rollup can convert TypeScript to JavaScript
    ]
};