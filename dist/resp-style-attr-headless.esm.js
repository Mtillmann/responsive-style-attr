/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var defaultOptions = {
    debug: false,
    breakpointSelector: 'html',
    breakpointKey: 'default',
    selectorTemplate: function (s) { return ".rsa-" + s; },
    selectorPropertyAttacher: function (node, hash) { return node.classList.add("rsa-" + hash); },
    attachStyleNodeTo: 'head',
    scopedStyleNode: true,
    breakpoints: null,
    ignoreDOM: false,
    alwaysPrependMediatype: true,
    minMaxSubtract: 0.02,
    useMQL4RangeContext: false,
    removeDataAttribute: false
};

function emitDebugMessage(data, type) {
    if (type === void 0) { type = 'info'; }
    if (defaultOptions.debug) {
        console[type]('ResponsiveStyleAttributes DEBUG:', data);
    }
}

var Breakpoints = /** @class */ (function () {
    function Breakpoints(options) {
        if (options === void 0) { options = {}; }
        this.breakpoints = [['undefined', '0px']];
        this.breakpointMap = {};
        this.keyMap = [];
        this.regexps = {};
        this.options = options;
        this.selector = this.options.breakpointSelector;
        this.key = this.options.breakpointKey;
        this.getBreakpoints();
    }
    Breakpoints.prototype.index = function (key) {
        return this.keyMap.indexOf(key);
    };
    Breakpoints.prototype.next = function (key) {
        return this.breakpoints[this.index(key) + 1];
    };
    Breakpoints.prototype.value = function (key) {
        return this.breakpointMap[key] || null;
    };
    Breakpoints.prototype.test = function (keyToTest) {
        return this.regexps.test.test(keyToTest);
    };
    Breakpoints.prototype.processKey = function (mediaQuery, keyToParse) {
        var usesOnlyBreakpointKeys = this.regexps.usesOnlyBreakpointKeys.exec(keyToParse), usesMixedValues = this.regexps.usesMixedValues.exec(keyToParse), compareEquality = /^\wte/.test(keyToParse);
        var upper = null, lower = null;
        if (usesMixedValues) {
            if (usesMixedValues[1] && usesMixedValues[2]) {
                lower = this.value(usesMixedValues[1]);
                upper = usesMixedValues[2];
            }
            else if (usesMixedValues[3] && usesMixedValues[4]) {
                lower = usesMixedValues[3];
                upper = this.value(usesMixedValues[4]);
            }
        }
        else if (usesOnlyBreakpointKeys) {
            var first = usesOnlyBreakpointKeys[1], second = usesOnlyBreakpointKeys[2];
            var isOnly = this.regexps.isOnly.test(keyToParse), isLT = this.regexps.isLT.test(keyToParse), isBetween = this.regexps.isBetween.test(keyToParse);
            lower = this.value(first);
            if (isOnly) {
                var next = this.next(first);
                if (next) {
                    //if the largest is used, there is no "next" use as max-width
                    upper = next[1];
                }
            }
            else if (isLT) {
                upper = lower;
                lower = null;
            }
            else if (isBetween) {
                upper = this.value(second);
            }
        }
        else {
            var actualBreakpoints = this.regexps.actualBreakpoints.exec(keyToParse), isGT = this.regexps.isGT.test(keyToParse), isLT = this.regexps.isLT.test(keyToParse), isBetween = this.regexps.isBetween.test(keyToParse);
            if (actualBreakpoints) {
                if (isBetween) {
                    lower = actualBreakpoints[1];
                    upper = actualBreakpoints[2];
                }
                else if (isLT) {
                    upper = actualBreakpoints[3];
                }
                else if (isGT) {
                    lower = actualBreakpoints[3];
                }
                else {
                    lower = actualBreakpoints[0];
                }
            }
        }
        if (this.options.useMQL4RangeContext) {
            if (lower && upper) {
                mediaQuery[':mql4rc'] = lower + " < width < " + upper;
            }
            else if (lower) {
                mediaQuery[':mql4rc'] = "width >" + (compareEquality ? '=' : '') + " " + lower;
            }
            else if (upper) {
                mediaQuery[':mql4rc'] = "width <" + (compareEquality ? '=' : '') + " " + upper;
            }
        }
        else {
            if (lower) {
                var value = parseFloat(lower), unit = lower.replace(String(value), '');
                if (compareEquality) {
                    value -= this.options.minMaxSubtract;
                }
                mediaQuery['min-width'] = value + unit;
            }
            if (upper) {
                var value = parseFloat(upper), unit = upper.replace(String(value), '');
                if (!compareEquality) {
                    value -= this.options.minMaxSubtract;
                }
                mediaQuery['max-width'] = value + unit;
            }
        }
    };
    Breakpoints.prototype.getBreakpoints = function () {
        var _this = this;
        var computedStyle, breakpointDefinition, propertyName = "--breakpoints-" + this.key, keys = [];
        if (this.options.breakpoints) {
            this.breakpoints = this.options.breakpoints;
        }
        else if (typeof window !== 'undefined') {
            computedStyle = getComputedStyle(document.querySelector(this.selector) || document.documentElement);
            breakpointDefinition = computedStyle.getPropertyValue(propertyName);
            if (!breakpointDefinition) {
                emitDebugMessage("No JSON breakpoint definition found for \"" + this.selector + " { " + propertyName + ": ... ; }\"", 'error');
            }
            try {
                this.breakpoints = JSON.parse(breakpointDefinition);
            }
            catch (error) {
                emitDebugMessage("JSON.parse failed for breakpoint definition of \"" + this.selector + " { " + propertyName + ": ... ; }\": " + error.message, 'error');
                emitDebugMessage("JSON given \"" + breakpointDefinition + "\"", 'error');
                this.breakpoints = [['undefined', '0px']];
            }
            if (!(this.breakpoints instanceof Array)) {
                emitDebugMessage('JSON parse of given breakpoints did not yield expected array in format [["key", "value"], ...]');
                this.breakpoints = [['undefined', '0px']];
            }
        }
        this.breakpoints.forEach(function (item) {
            _this.keyMap.push(item[0]);
            _this.breakpointMap[item[0]] = item[1];
            keys.push(item[0]);
        });
        var keysOnlyString = keys.join('|'), keysAndValuesString = keysOnlyString + '|\\d+\\w{2,3}';
        this.regexps = {
            test: new RegExp("^([lg]te?-?)?(" + keysAndValuesString + ")(-(to|up|down)-?)?(" + keysAndValuesString + ")?$"),
            isOnly: new RegExp("^(" + keysOnlyString + ")$"),
            isGT: new RegExp("^(gte?-(" + keysAndValuesString + "))|((" + keysAndValuesString + ")-up)$"),
            isLT: new RegExp("^(lte?-(" + keysAndValuesString + "))|((" + keysAndValuesString + ")-down)$"),
            isBetween: new RegExp("^(" + keysAndValuesString + ")-to-(" + keysAndValuesString + ")$"),
            actualBreakpoints: new RegExp('^(?:(\\d+\\w{2,3})-to-(\\d+\\w{2,3})|(?:(?:\\wte?-)?(\\d+\\w{2,3}))(?:-\\w{2,4})?)$'),
            usesOnlyBreakpointKeys: new RegExp("^(?:[lg]te?-?)?(" + keysOnlyString + ")(?:-(?:to|up|down)-?)?(" + keysOnlyString + ")?$"),
            usesMixedValues: new RegExp("^(?:(" + keysOnlyString + ")-to-(\\d+\\w{2,3})|(\\d+\\w{2,3})-to-(" + keysOnlyString + "))$"),
        };
        return this.breakpoints;
    };
    return Breakpoints;
}());

var instances = {};
var Css = /** @class */ (function () {
    function Css(options) {
        if (options === void 0) { options = {}; }
        this.mediaQueries = {};
        this.styles = {};
        this.regexps = {};
        this.hashSeed = 0;
        this.options = {};
        this.nodes = [];
        this.options = __assign(__assign({}, defaultOptions), options);
        var instanceKey = this.options.breakpointKey + "_" + this.options.breakpointSelector;
        if (instanceKey in instances) {
            emitDebugMessage("instance " + instanceKey + " already exists, using existing instance and calling refresh()...");
            if (!this.options.ignoreDOM) {
                instances[instanceKey].refresh();
            }
            return instances[instanceKey];
        }
        instances[instanceKey] = this;
        this.breakpoints = new Breakpoints(this.options);
        this.hashSeed = Number((String(Math.random()).match(/\d{1,9}$/) || [1234]).shift());
        this.regexps = {
            featureMatcher: /^([\d\w-_\.]+)\(?(.*?)\)?$/i,
            orientation: /^landscape|portrait$/,
            mediaTypes: /screen|all|print|speech/
        };
        if (!this.options.ignoreDOM) {
            this.refresh();
        }
    }
    Css.prototype.refresh = function () {
        var s = this.options.breakpointSelector, k = this.options.breakpointKey, selector = this.options.breakpointSelector === 'html' && this.options.breakpointKey === 'default' ?
            '[data-rsa-style]:not([data-rsa-is-processed],[data-rsa-selector],[data-rsa-key]),[data-rsa-selector=html]:not([data-rsa-is-processed],[data-rsa-key]),[data-rsa-key=default]:not([data-rsa-is-processed],[data-rsa-selector])'
            : "[data-rsa-key=\"" + k + "\"][data-rsa-selector=\"" + s + "\"]:not([data-rsa-is-processed]),[data-rsa-key=\"" + k + "\"]:not([data-rsa-selector],[data-rsa-is-processed]),[data-rsa-selector=\"" + s + "\"]:not([data-rsa-key],[data-rsa-is-processed])", nodes = document.querySelectorAll(selector);
        for (var i = 0; i < nodes.length; i++) {
            this.add(nodes[i]);
        }
        this.deployStyleSheet();
        return nodes;
    };
    Css.prototype.add = function (node) {
        var _this = this;
        var input = node.dataset.rsaStyle || '', parsed = {};
        node.dataset.rsaIsProcessed = 'true';
        try {
            parsed = JSON.parse(input);
        }
        catch (e) {
            emitDebugMessage("JSON.parse failed on: \"" + input + "\"");
            return false;
        }
        this.push(parsed, node).forEach(function (hash) { return _this.options.selectorPropertyAttacher(node, hash); });
        this.nodes.push(node);
        return node;
    };
    Css.prototype.addStyle = function (mediaQuery, selector, styles) {
        if (!(mediaQuery in this.styles)) {
            this.styles[mediaQuery] = {};
        }
        if (!(selector in this.styles[mediaQuery])) {
            this.styles[mediaQuery][selector] = styles;
        }
        return true;
    };
    Css.prototype.deployStyleSheet = function () {
        var _this = this;
        var id = "rsa-stylesheet-" + this.hashSeed, target = (function () {
            if (typeof _this.options.attachStyleNodeTo === 'string') {
                return document.querySelector(_this.options.attachStyleNodeTo);
            }
            if (_this.options.attachStyleNodeTo instanceof HTMLElement) {
                return _this.options.attachStyleNodeTo;
            }
            return document.head;
        })(), node = target.querySelector("#" + id) || (function () {
            var el = document.createElement('style');
            el.setAttribute('id', id);
            el.setAttribute('type', 'text/css');
            if (_this.options.scopedStyleNode) {
                el.setAttribute('scoped', '');
            }
            target.appendChild(el);
            return el;
        })();
        node.innerHTML = this.getCss();
        this.nodes.forEach(function (node) { return node.classList.remove('rsa-pending'); });
        node.dispatchEvent(new CustomEvent('rsa:cssdeployed', { bubbles: true, detail: this }));
    };
    Css.prototype.reOrderStyles = function (styleString) {
        return styleString.split(';')
            .filter(function (e) { return e.trim() !== ''; })
            .map(function (e) { return e.trim().replace(/\s*:\s*/g, ':'); })
            .sort().join(';');
    };
    Css.prototype.keyToMediaQuery = function (key, node) {
        var _a;
        if (node === void 0) { node = null; }
        if (key in this.mediaQueries) {
            return this.mediaQueries[key];
        }
        var queries = key.split('@,@'), mediaQueries = [];
        for (var queryIndex = 0; queryIndex < queries.length; queryIndex++) {
            var keyParts = queries[queryIndex].split('@').filter(function (s) { return s.trim() !== ''; }), mediaQueryParts = {}, mediaQueryPartsArray = [];
            if (this.options.alwaysPrependMediatype) {
                mediaQueryParts.media = 'all';
            }
            for (var i = 0; i < keyParts.length; i++) {
                var fragment = keyParts[i].trim();
                if (i === 0 && this.regexps.mediaTypes.test(fragment)) {
                    mediaQueryParts.media = fragment;
                }
                else if (this.regexps.orientation.test(fragment)) {
                    mediaQueryParts.orientation = fragment;
                }
                else if (this.breakpoints.test(fragment)) {
                    this.breakpoints.processKey(mediaQueryParts, fragment);
                }
                else if (fragment[0] === '(') {
                    mediaQueryParts[':' + fragment] = fragment.slice(1, -1);
                }
                else {
                    //attempt to check if feature exists and run feature
                    var featureMatches = this.regexps.featureMatcher.exec(fragment);
                    if (this.options.features && featureMatches && featureMatches[1] && featureMatches[1] in this.options.features) {
                        (_a = this.options.features)[featureMatches[1]].apply(_a, [mediaQueryParts, featureMatches[2], key, node]);
                    }
                }
            }
            //compile mediaQuery;
            if (mediaQueryParts.media) {
                mediaQueryPartsArray.push(mediaQueryParts.media);
                delete mediaQueryParts.media;
            }
            for (var _i = 0, _b = Object.entries(mediaQueryParts); _i < _b.length; _i++) {
                var _c = _b[_i], k = _c[0], v = _c[1];
                if (v === true) {
                    mediaQueryPartsArray.push("(" + k + ")");
                }
                else if (v !== false) {
                    var key_1 = k[0] === ':' ? '' : k + ": ";
                    mediaQueryPartsArray.push("(" + key_1 + v + ")");
                }
                //do nothing
            }
            mediaQueries.push(mediaQueryPartsArray.join(' and '));
        }
        this.mediaQueries[key] = '@media ' + mediaQueries.join(', ');
        return this.mediaQueries[key];
    };
    /**
     * great cyrb53 hash from https://stackoverflow.com/a/52171480
     * @param str
     * @param seed
     */
    Css.prototype.hash = function (str, seed) {
        if (seed === void 0) { seed = 0; }
        var h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
        for (var i = 0, ch = void 0; i < str.length; i++) {
            ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return 4294967296 * (2097151 & h2) + (h1 >>> 0);
    };
    Css.prototype.getCss = function () {
        var content = [];
        for (var mediaQuery in this.styles) {
            content.push(mediaQuery + "{");
            for (var selector in this.styles[mediaQuery]) {
                content.push("\t" + selector + "{ " + this.styles[mediaQuery][selector] + " }");
            }
            content.push('}');
        }
        return content.join("\n");
    };
    Css.prototype.push = function (styleObject, node) {
        if (node === void 0) { node = null; }
        if (typeof styleObject === 'string') {
            styleObject = JSON.parse(styleObject);
        }
        var hashes = [];
        for (var key in styleObject) {
            var mediaQuery = this.keyToMediaQuery(key, node), style = this.reOrderStyles(styleObject[key]), hash = this.hash(mediaQuery + ":" + style, this.hashSeed), selector = this.options.selectorTemplate(hash);
            this.addStyle(mediaQuery, selector, style);
            hashes.push(hash);
        }
        return hashes;
    };
    return Css;
}());

var Headless = /** @class */ (function (_super) {
    __extends(Headless, _super);
    function Headless(options) {
        if (options === void 0) { options = {}; }
        return _super.call(this, Object.assign({
            ignoreDOM: true,
            selectorTemplate: function (s) { return "[data-rsa-" + s + "]"; },
            selectorPropertyAttacher: function (hash) { return "data-rsa-" + hash; }
        }, options || {})) || this;
    }
    Headless.prototype.parse = function (html, remove) {
        var _this = this;
        if (remove === void 0) { remove = false; }
        html = html.replace(/data-rsa-style='(\{.*\})'/g, function (string, json) {
            var styleObject = {};
            try {
                styleObject = JSON.parse(json);
            }
            catch (e) {
                emitDebugMessage("JSON.parse failed on: \"" + json + "\"");
                return string;
            }
            if (remove || _this.options.removeDataAttribute) {
                string = '';
            }
            var attributes = _this.push(styleObject).map(function (hash) { return _this.options.selectorPropertyAttacher(hash); });
            return (string + ' ' + attributes.join(' ')).trim();
        });
        return html;
    };
    Headless.prototype.getStyleSheet = function () {
        return "<style type=\"text/css\" id=\"rsa-stylesheet-" + this.hashSeed + "\"" + (this.options.scopedStyleNode ? ' scoped' : '') + ">\n" + this.getCss() + "\n</style>\n";
    };
    return Headless;
}(Css));

export { Headless };
