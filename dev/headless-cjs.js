const {Headless : x} = require('../dist/resp-style-attr-headless.cjs')
console.log(new x().parse(`<div data-rsa-style='{"lt-400px":"border: 1px solid #000"}'></div>`));