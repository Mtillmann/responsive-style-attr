import typescript from '@rollup/plugin-typescript';

export default {
    // browser-friendly UMD build
    input: 'src/main.ts',
    output: [{
        sourcemap: true,
        name: 'RespStyleAttr',
        file: 'dev/js/rsa.dev.umd.js',
        format: 'umd'
    },{
        sourcemap: true,
        name: 'RespStyleAttr',
        file: 'tests/rsa.dev.umd.js',
        format: 'umd'
    }],
    plugins: [
        typescript({sourceMap: true}) // so Rollup can convert TypeScript to JavaScript
    ]
};