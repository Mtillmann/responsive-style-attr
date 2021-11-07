import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';

export default [

    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // an array for the `output` option, where we can specify
    // `file` and `format` for each target)
    {
        input: 'src/headless.ts',
        plugins: [
            typescript() // so Rollup can convert TypeScript to JavaScript
        ],
        output: [
            { file: pkg.main.replace(/\./,'-headless.'), format: 'cjs' },
            { file: pkg.module.replace(/\./,'-headless.'), format: 'es' }
        ]
    }
];
