import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
    // browser-friendly UMD build
    input: 'src/server.ts',
    output: [{
        sourcemap: true,
        name: 'RespStyleAttr',
        file: 'dev/js/rsa-server.dev.umd.js',
        format: 'umd'
    },{
        sourcemap: true,
        name: 'RespStyleAttr',
        file: 'test/rsa-server.dev.umd.js',
        format: 'umd'
    }],
    plugins: [
        resolve(),   // so Rollup can find `ms`
        commonjs(),  // so Rollup can convert `ms` to an ES module
        typescript({sourceMap: true}) // so Rollup can convert TypeScript to JavaScript
    ]
};