const {Headless} = require('../dist/resp-style-attr-headless.cjs'),
    instance = new Headless();
console.log(instance.parse(`<div data-rsa-style='{"lt-400px":"border: 1px solid #000"}'></div>`));
console.log(instance.parse(`<div data-rsa-style='{"lt-400px":"border: 1px solid #000"}'></div>`, true));

console.log(instance.push('{"gt-800px":"background:#f00;"}'));
console.log(instance.push({"gt-1000px":"background:#00f;","portrait" : "padding:20px" }));

console.log(instance.getCss());