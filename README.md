# Responsive Style Attributes

Control the responsive style of html elements without creating one-off classes and media queries in your stylesheets.

## Installation

`npm i responsive-style-attr --save`

The package contains three builds:

- `dist/resp-style-attr.cjs.js` - CommonJS bundle, suitable for use in Node.js
- `dist/resp-style-attr.esm.js` - ES module bundle, suitable for use in other people's libraries and applications
- `dist/resp-style-attr.umd(.min).js` - UMD build, suitable for use in any environment (including the browser, as
  a `<script>` tag)

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

The data-attribute object's keys are expanded to media queries while the values are made into selectors and style rules that are placed inside the media queries. The above example would expand to

```css
@media all and (min-width: 255px) and (max-width: 512px) {
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
@media all and (min-width: 255px) and (max-width: 500px) and (orientation: portrait) {
}

/* ... see the expansion spec file for more examples */
```

Out of the box, this are supported query shortcuts in the object keys:

| name         | syntax       | description                                                  |
| ------------ | ------------ | ------------------------------------------------------------ |
| media type   | `screen`     | creates a media query that matches one or more given media types (screen,all,print,speech) |
| orientation   | `portrait`     | creates a media query that matches given orientation (`portrait` or `landscape`) |
| literal up   | `800px-up`   | creates a media query that only matches viewports wider than the given value and unit |
| literal down | `500px-down` | creates a media query that only matches viewports narrower than the given value and unit |
| literal between | `500px-to-1000px` | creates a media query that only matches viewports between the two given values |

## `OR` for different feature sets

You can use `@,@` to split a shorthand key into multiple media queries. This is useful when you want to address vendor-specific features for the same style, for example `-webkit-min-device-pixel-ratio` and `min-resolution`.

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
| breakpoint only   | `md`   | creates a media query that only matches viewports between the the given breakpoint and the next larger one (if a larger exists)  |
| breakpoint up   | `xs-up`   | creates a media query that only matches viewports wider than the value of the given breakpoint |
| breakpoint down | `lg-down` | creates a media query that only matches viewports narrower than the value of the given breakpoint |
| breakpoint between | `md-to-xl` | creates a media query that only matches viewports between the two given breakpoints |
| mixed between | `md-to-1000px`, `400px-to-xl` | creates a media query that only matches viewports between the given breakpoint and the literal value |

### Controlling Breakpoint Sets

When using breakpoint sets, two additional data-attributes control which selector contains breakpoint set CSS variable and the name of the CSS variable:

#### `data-rsa-selector[="html"]`

The breakpoint set variable for the element will be picked off this selector.

#### `data-rsa-key[="default"]`

Controls the name of the CSS variable, from which the breakpoint set is parsed:

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
        },
        wkmdpr: function (mediaQuery, devicePixelRatio) {
            // sets the device pixel ratio feature on media query
            mediaQuery['-webkit-min-device-pixel-ratio'] = devicePixelRatio;
        },
        keyValue: function (mediaQuery, args) {
            // sets anything you pass on the media query
            const [key, value] = args.split(',');
            mediaQuery[key] = value;
        }
    }
}
```

The custom features would be used like this:

```html
<p data-rsa-style='{"androidOnly" : "border: 1px solid #000;"}'>I have a border on android devices</p>
<p data-rsa-style='{"usMustMatch(ios)" : "border: 1px solid #000;"}'>I have a border on iOs devices</p>
<p data-rsa-style='{"wkmdpr(2)" : "border: 1px solid #000;"}'>I have a border on devices that have a webkit-min-device-pixel-ratio of at least 2</p>
<p data-rsa-style='{"keyValue(min-resolution,2dppx)" : "border: 1px solid #000;"}'>I have a border on devices that have a min-resolution of 2dppx</p>
```

If you set a feature to `true` it will be written without a value. This is useful for features like `prefers-reduced-motion` where only the feature key is used in the query. Setting a feature to `false` will remove it from the final media query. A feature function can modify, set or remove more than one media query feature.

See `test/expansion.spec.js` for a few more examples.

## Options

Pass options to the `RespStyleAttr.init`-function or to the `RespStyleAttr.Css`-constructor when creating instances manually.

| name | type | default | description |
| --- | ---- | ---- | ---- |
| debug | bool | false | controls if verbose information is written to console |
| breakpointSelector | string | 'html' | the default breakpoint selector (compare `data-rsa-selector`) |
| breakpointKey | string | 'default' | the default breakpoint key (compare `data-rsa-key`) |
| selectorTemplate | function | ``s => `.rsa-${s}` `` | a small function that generates the selector that is used inside the generated stylesheet. Class is used by default but you could also create a data-attribute. You shouldn't create ids because the same selector may be used for multiple elements. |
| selectorPropertyAttacher | function | ``(node, hash) => node.classList.add(`rsa-${hash}`) `` | a function that actually attaches the property to the node. |
| attachStyleNodeTo | string\|HtmlElement | 'head' | Selector or node to which the generated style node is attached |
| scopedStyleNode | bool | true | controls whether the style node has a scoped attribute |
| breakpoints | Array\|null | null | Alternative way of passing a breakpoint set to an instances (see "Breakpoint sets" for more information) |
| ignoreDOM | bool | false | instructs the instance to ignore the dom, only used for testing |
| alwaysPrependMediatype | bool | true | controls if the media type is always set on generated media queries |

## API

The `RespStyleAttr` Object provides the main class `Css`, and the helper functions `init`, `refresh` and `get`.

### init

`RespStyleAttr.init()` will pick up all elements in your document that have a `data-rsa-style`-attribute and deploy the media queries and styles rules extracted from those attributes. Instances are created for each combination of `key` and `selector` attributes that are found on the nodes (or implied by default values). The default instance's key would be `default_html`.

If you pass options, they will be passed on to every instance created.

### refresh

If you add more elements that use responsive style attributes to the document, you can call the `RespStyleAttr.init()` -method to process all new and unprocessed elements and deploy their styles.

### get

`RespStyleAttr.get()` will yield a map of all instances, that are currently active. Pass an instance key to get only that instance.

## Manually Creating Instances

Just call `let myRSAInstance = new RespStyleAttr.Css()` to create a new instance. You should pass an options-object containing at least the `breakpointSelector` and `breakpointKey` properties.

If the constructor detects that an instance with the same instance key (consisting of given breakpoint key and breakpoint selector) already exists in the internal instance map, that instance will be refreshed and returned. You also can call `refresh` on an existing instance.