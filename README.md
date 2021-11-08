# Responsive Style Attributes

Control the responsive style of html elements without creating one-off classes and media queries in your stylesheets. [Here's a small demo](https://mtillmann.github.io/responsive-style-attr/). 

## Installation

`npm i responsive-style-attr --save`

The package contains three frontend builds:

- `dist/resp-style-attr.cjs.js` - CommonJS bundle, suitable for use in Node.js
- `dist/resp-style-attr.esm.js` - ES module bundle, suitable for use in other people's libraries and applications
- `dist/resp-style-attr.umd(.min).js` - UMD build, suitable for use in any environment (including the browser, as
  a `<script>` tag)

There are two builds for headless operation:

- `dist/resp-style-attr-headless.cjs.js` - CommonJS bundle, suitable for use in Node.js
- `dist/resp-style-attr-headless.esm.js` - ES module bundle, suitable for use in other people's libraries and applications

## Basic Usage

To enable responsive style on an element, just add a `data-rsa-style`-attribute containing a JSON object and call `RespStyleAttr.init()`:

```html
<h1 data-rsa-style='{"255px-to-512px" : "font-size: 1.5rem", "500px-up" : "font-size:2rem"}'>I change my font size according to screen width</h1>

<script>
    window.addEventListener('DOMContentLoaded', function () {
        RespStyleAttr.init();
    };
</script>
```

The data-attribute object's keys are expanded to media queries, the rules are put inside selectors that get wrapped by the media queries. The above example would expand to

```css
@media all and (min-width: 255px) and (max-width: 511.98px) {
    .rsa-7063658802351566 {
        font-size: 1.5rem
    }
}

@media all and (min-width: 500px) {
    .rsa-8982493736072943 {
        font-size: 2rem
    }
}
```

The generated classes are applied to the `<h1>`-node. Note that all media queries and style rules are sorted and equalized to avoid duplicate selectors.

## Media Query Shorthand Syntax

The media query shorthand syntax lets you combine multiple media query features, separated by an `@`-symbol. Examples:

```css
/* "1000px" expands to: */
@media all and (min-width: 1000px) {
}

/* "255px-to-500px@portrait" expands to: */
@media all and (min-width: 255px) and (max-width: 499.98px) and (orientation: portrait) {
}

/* ... see the expansion spec file for more examples */
```
> **Why subtract .02px?** Browsers don’t currently support [range context queries](https://www.w3.org/TR/mediaqueries-4/#range-context), so we work around the limitations of [min- and max- prefixes](https://www.w3.org/TR/mediaqueries-4/#mq-min-max) and viewports with fractional widths (which can occur under certain conditions on high-dpi devices, for instance) by using values with higher precision.  

[from the bootstrap 5.1 docs](https://getbootstrap.com/docs/5.1/layout/breakpoints/#media-queries)

Out of the box, this are supported query shortcuts in the object keys:

| name         | syntax       | description                                                  |
| ------------ | ------------ | ------------------------------------------------------------ |
| media type   | `screen`     | matches one or more given media types (screen,all,print,speech), _is expected as first feature_ in shorthand! |
| orientation   | `portrait`     | matches given orientation (`portrait` or `landscape`) |
| literal up  | `800px-up` or `gt-800px`  | matches viewports wider than the given value and unit |
| literal down | `500px-down` or `lt-500px` | matches viewports narrower than the given value and unit |
| literal between | `500px-to-1000px` | matches viewports between the two given values |
| lte | `lte-500px` | matches viewports narrower than _or equal to_ given value |
| gte | `gte-500px` | matches viewports wider than _or equal to_ given value |

## `OR` for different feature sets

You can use `@,@` to split a shorthand key into multiple media queries. This is useful when you want to address vendor-specific features for the same style, for example `-webkit-min-device-pixel-ratio` and `min-resolution`.

## Literal Features

To use a media query feature _as is_, just write it wrapped in parentheses, like this:
```css
/* "lt-1000px@(prefers-color-scheme: dark)" would expand to: */
@media all and (max-width: 999.98px) and (prefers-color-scheme: dark) {
  /* .... */
}
```
## Negations and MQL4 Boolean Operators

Neither is currently implemented but may be at a later time.


## Using Breakpoint Sets in Shortcuts

In addition to the literal viewport size shortcuts, you can define breakpoint sets in your stylesheet as a CSS variable and use them in shortcuts. For example, a bootstrap 5 breakpoint set CSS variable would look like this:

```css
html {
    --breakpoints-default: [["xs","0"], ["sm","576px"], ["md","768px"], ["lg","992px"], ["xl","1200px"], ["xxl","1400px"]];
}
```

This list is picked up by the breakpoint parser and enables the following shortcuts:

| name         | syntax       | description                                                  |
| ------------ | ------------ | ------------------------------------------------------------ |
| breakpoint only   | `md`   | matches viewports between the given breakpoint and the next larger one (if a larger exists)  |
| breakpoint up   | `xs-up` or `gt-xs`  | matches viewports wider than the value of the given breakpoint |
| breakpoint down | `lg-down` or `lt-xs` | matches viewports narrower than the value of the given breakpoint |
| breakpoint between | `md-to-xl` | matches viewports between the two given breakpoints |
| mixed between | `md-to-1000px`, `400px-to-xl` | matches viewports between the given breakpoint and the literal value |
| lte | `lte-500px` | matches viewports narrower than _or equal to_ given breakpoint |
| gte | `gte-500px` | matches viewports wider than _or equal to_ given breakpoint |


### Controlling Breakpoint Sets

When using breakpoint sets, two additional data-attributes control which selector contains breakpoint set CSS variable and the name of the CSS variable:

#### `data-rsa-selector[="html"]`

The breakpoint set variable for the element will be picked off this selector.

#### `data-rsa-key[="default"]`

Controls the name of the CSS variable from which the breakpoint set is parsed:

```css
html {
/* ^ the selector */
    --breakpoints-default: "json...";
    /* the key    ^^^^^^^ */
}
```

### Example implementations

The `src/scss` folder contains example code for bulma, bootstrap and foundation to render each framework's breakpoint-map into your stylesheet.

## Custom Shortcut Features

If you need to go deeper, you can create custom shortcut features that modify every feature of the media query. The custom features must be passed in the `options`-object of the `init`-function.

```javascript
let options = {
    features: {
        androidOnly: function (mediaQuery) {
            // this will set the media type to "none" on devices that are not android
            if (!/android/i.test(userAgent)) {
                mediaQuery.media = 'none'
            }
        },
        uaMustMatch: function (mediaQuery, input) {
            //this will disable the the mediaquery if the useragent does not match input ...
            const re = new RegExp(input, 'i');
            if (!re.test(userAgent)) {
                mediaQuery.media = 'none';
            }
        }
    }
}
```

The custom features would be used like this:

```html
<p data-rsa-style='{"androidOnly" : "border: 1px solid #000;"}'>I have a border on android devices</p>
<p data-rsa-style='{"usMustMatch(ios)" : "border: 1px solid #000;"}'>I have a border on iOs devices</p>
```

If you set a feature to `true` it will be written without a value. This is useful for setting features like `prefers-reduced-motion` where only the feature key is used in the query. Setting a feature to `false` will remove it from the final media query. A feature function can modify, set or remove more than one media query feature.

If you prefix the feature key with `:` the key will be omitted from the final media query and only the value will be used. This can be handy for things like level 4 range context where the expression is not in `key: value` format.

See `test/expansion.spec.js` for a few more examples.

## Options

Pass options to the `RespStyleAttr.init`-function or to the `RespStyleAttr.Css`-constructor when creating instances manually.
You can also set options for all instances by modifying the default options via `RespStyleAttr.defaultOptions`.

| name | type | default | description |
| --- | ---- | ---- | ---- |
| debug | bool | false | controls if verbose information is written to console |
| breakpointSelector | string | 'html' | the default breakpoint selector (compare `data-rsa-selector`) |
| breakpointKey | string | 'default' | the default breakpoint key (compare `data-rsa-key`) |
| selectorTemplate | function | ``s => `.rsa-${s}` `` | a small function that generates the selector used inside the generated stylesheet. Class is used by default but you could also create a data-attribute. Don't create ids because the same selector may be used for multiple elements. |
| selectorPropertyAttacher | function | ``(node, hash) => node.classList.add(`rsa-${hash}`) `` | a function that actually attaches the property to the node. |
| attachStyleNodeTo | string\|HtmlElement | 'head' | Selector or node to which the generated style node is attached |
| scopedStyleNode | bool | true | controls whether the style node has a scoped attribute |
| breakpoints | Array\|null | null | Alternative way of passing a breakpoint set to an instances (see "Breakpoint sets" for more information) |
| ignoreDOM | bool | false | instructs the instance to ignore the dom, only used for testing |
| alwaysPrependMediatype | bool | true | controls if the media type is always set on generated media queries |
| minMaxSubtract | float | 0.02 | value that is subtracted from values in certain situations (see notice above) |
| useMQL4RangeContext | bool | false | if enabled, screen width query features will be generated in new syntax |

## API

The `RespStyleAttr` Object provides the main class `Css`, and the helper functions `init`, `refresh` and `get`.

### init

`RespStyleAttr.init()` will pick up all elements in your document that have a `data-rsa-style`-attribute and deploy the media queries and styles rules extracted from those attributes. Instances are created for each combination of `key` and `selector` attributes that are found on the nodes (or implied by default values). The default instance's key would be `default_html`.

If you pass options, they will be passed on to every instance created.

### refresh

If you add more elements that use responsive style attributes to the document, you can call the `RespStyleAttr.init()` -method to process all new and unprocessed elements and deploy their styles.

### get

`RespStyleAttr.get()` will yield a map of all instances. Pass an instance key to get only that instance.

## Manually Creating Instances

Just call `let myRSAInstance = new RespStyleAttr.Css()` to create a new instance. You should pass an options-object containing at least the `breakpointSelector` and `breakpointKey` properties.

If the constructor detects that an instance with the same instance key (consisting of given breakpoint key and breakpoint selector) already exists in the internal instance map, that instance will be refreshed and returned. You also can call `refresh` on an existing instance.

## Events

There is currently only one event supported: `rsa:cssdeployed` will be dispatched on the `<style>`-node that belongs to the instance. You can use it like this:

```javascript
window.addEventListener('rsa:cssdeployed', e => {
    console.log(e.detail);
    //is a reference to `Css`-instance that dispatched the event
})
```

## Preventing FOUC

If you want to prevent FOUC, add the class `rsa-pending` to your elements. When the stylesheet is deployed, the class is removed from each elements' class list. Since the nodes usually aren't measured etc during style creation, just use:

```css
.rsa-pending{ display: none }
/* or */
.rsa-pending{ visibility: hidden }
```

## Headless

The "headless" variant lets you generate stylesheets off of document fragments. It does not rely on the DOM so you can run it in a node environment. Since `classList` is not available, data-attributes and data-attribute selectors are generated by default. The headless variant also supports an extra option

| name | type | default | description |
| --- | ---- | ---- | ---- |
| removeDataAttribute | bool | false | when true, occurences of `data-rsa-style="..."` are removed from the given fragment |

### Usage

Since `Headless` extends `Css`, it takes the same options. Parse a fragment like this:
```javascript
const {Headless} = require('...path-to/resp-style-attr-headless.cjs'),
        instance = new Headless(),
        someHTML = `<div data-rsa-style='{"lt-400px":"border: 1px solid #000"}'></div>`;

instance.parse(someHTML);
// -> <div data-rsa-style='{"lt-400px":"border: 1px solid #000"}' data-rsa-3523518655946362></div>

// passing true as the second arg will remove the original data-attribute
instance.parse(someHTML, true);
// -> <div data-rsa-3523518655946362></div>
```
You can call `parse` on the same instance repeatedly or pass an entire document. `parse`'s output will be the input fragment but with selector attributes added. 

Adding styles directly is also supported, simply pass an object or json string to the `push` method and receive a list of hashes, that you can convert into attributes and attach them yourself:

> `push` is also supported by the browser variant!

```javascript
//...
instance.push('{"gt-800px":"background:#f00;"}');
//-> ['data-rsa-6088263273057222']
instance.push({"gt-1000px":"background:#00f;","portrait" : "padding:20px" });
//-> ['data-rsa-366898066636896', 'data-rsa-2976456585877488']
```

Finally, you can fetch the css that has been generated from all styles by calling `getCss` or get a style node by calling `getStyleSheet`.

```javascript
//...
instance.getCss();

// -> @media all and (max-width: 399.98px){
//      [data-rsa-3523518655946362]{ border:1px solid #000 }
//    }
//    @media all and (min-width: 800px){
//      [data-rsa-6088263273057222]{ background:#f00 }
//    }
//    @media all and (min-width: 1000px){
//      [data-rsa-366898066636896]{ background:#00f }
//    }
//    @media all and (orientation: portrait){
//      [data-rsa-2976456585877488]{ padding:20px }
//    }
```