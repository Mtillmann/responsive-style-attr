import {Breakpoints} from "./breakpoints";
import {emitDebugMessage} from "./debugMessage";
import {defaultOptions} from "./defaultOptions";

export var instances: any = {};

export class Css {
    breakpoints!: Breakpoints;
    mediaQueries: any = {};
    styles: any = {};
    regexps: any = {};
    hashSeed: number = 0;
    options: any = {};
    nodes: HTMLElement[] = [];

    constructor(options: any = {}) {
        this.options = {...defaultOptions, ...options};

        let instanceKey = `${this.options.breakpointKey}_${this.options.breakpointSelector}`;

        if (instanceKey in instances) {
            emitDebugMessage(`instance ${instanceKey} already exists, using existing instance and calling refresh()...`)
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

    refresh() {
        const s = this.options.breakpointSelector,
            k = this.options.breakpointKey,
            selector = this.options.breakpointSelector === 'html' && this.options.breakpointKey === 'default' ?
                '[data-rsa-style]:not([data-rsa-is-processed],[data-rsa-selector],[data-rsa-key]),[data-rsa-selector=html]:not([data-rsa-is-processed],[data-rsa-key]),[data-rsa-key=default]:not([data-rsa-is-processed],[data-rsa-selector])'
                : `[data-rsa-key="${k}"][data-rsa-selector="${s}"]:not([data-rsa-is-processed]),[data-rsa-key="${k}"]:not([data-rsa-selector],[data-rsa-is-processed]),[data-rsa-selector="${s}"]:not([data-rsa-key],[data-rsa-is-processed])`,
            nodes = document.querySelectorAll(selector);

        for (let i = 0; i < nodes.length; i++) {
            this.add(nodes[i] as HTMLElement);
        }

        this.deployStyleSheet();

        return nodes;
    }

    add(node: HTMLElement): HTMLElement | boolean {
        let input: string = node.dataset.rsaStyle || '',
            parsed: any = {},
            info: object[] = [];

        node.dataset.rsaIsProcessed = 'true';

        try {
            parsed = JSON.parse(input);
        } catch (e) {
            emitDebugMessage(`JSON.parse failed on: "${input}"`)
            return false;
        }

        this.push(parsed, node).forEach(hash => this.options.selectorPropertyAttacher(node, hash));

        this.nodes.push(node);

        return node;
    };

    addStyle(mediaQuery: string, selector: string, styles: string): boolean {
        if (!(mediaQuery in this.styles)) {
            this.styles[mediaQuery] = {};
        }
        if (!(selector in this.styles[mediaQuery])) {
            this.styles[mediaQuery][selector] = styles;
        }
        return true;
    };

    deployStyleSheet() {
        let id = `rsa-stylesheet-${this.hashSeed}`,
            target = (() => {
                if (typeof this.options.attachStyleNodeTo === 'string') {
                    return document.querySelector(this.options.attachStyleNodeTo);
                }
                if (this.options.attachStyleNodeTo instanceof HTMLElement) {
                    return this.options.attachStyleNodeTo;
                }
                return document.head;
            })(),
            node = target.querySelector(`#${id}`) || (() => {
                let el = document.createElement('style');
                el.setAttribute('id', id);
                el.setAttribute('type', 'text/css');
                if (this.options.scopedStyleNode) {
                    el.setAttribute('scoped', '');
                }
                target.appendChild(el);
                return el;
            })();

        node.innerHTML = this.getCss();

        this.nodes.forEach(node => node.classList.remove('rsa-pending'));

        node.dispatchEvent(new CustomEvent('rsa:cssdeployed', {bubbles: true, detail: this}));
    };

    reOrderStyles(styleString: string): string {
        return styleString.split(';')
            .filter(e => e.trim() !== '')
            .map(e => e.trim().replace(/\s*:\s*/g,':'))
            .sort().join(';');
    }

    keyToMediaQuery(key: string, node: null | HTMLElement = null): string {
        if (key in this.mediaQueries) {
            return this.mediaQueries[key];
        }
 
        let queries = key.split('@,@'),
            mediaQueries: string[] = [];
        for (let queryIndex = 0; queryIndex < queries.length; queryIndex++) {

            let keyParts = queries[queryIndex].split('@').filter(s => s.trim() !== ''),
                mediaQueryParts: any = {},
                mediaQueryPartsArray: string[] = []
            if (this.options.alwaysPrependMediatype) {
                mediaQueryParts.media = 'all';
            }

            for (let i = 0; i < keyParts.length; i++) {
                const fragment: string = keyParts[i].trim();
                if (i === 0 && this.regexps.mediaTypes.test(fragment)) {
                    mediaQueryParts.media = fragment;
                } else if (this.regexps.orientation.test(fragment)) {
                    mediaQueryParts.orientation = fragment;
                } else if (this.breakpoints.test(fragment)) {
                    this.breakpoints.processKey(mediaQueryParts, fragment);
                } else if (fragment[0] === '(') {
                    mediaQueryParts[':' + fragment] = fragment.slice(1, -1);

                } else {
                    //attempt to check if feature exists and run feature
                    let featureMatches = this.regexps.featureMatcher.exec(fragment);
                    if (this.options.features && featureMatches! && featureMatches[1] && featureMatches[1] in this.options.features) {

                        this.options.features[featureMatches[1]](...[mediaQueryParts, featureMatches[2], key, node]);
                    }
                }
            }

            //compile mediaQuery;
            if (mediaQueryParts.media) {
                mediaQueryPartsArray.push(mediaQueryParts.media);
                delete mediaQueryParts.media;
            }

            for (const [k, v] of Object.entries(mediaQueryParts)) {
                if (v === true) {
                    mediaQueryPartsArray.push(`(${k})`);
                } else if (v !== false) {
                    let key = k[0] === ':' ? '' : `${k}: `;
                    mediaQueryPartsArray.push(`(${key}${v})`);
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
    hash(str: string, seed = 0) {
        let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
        for (let i = 0, ch; i < str.length; i++) {
            ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return 4294967296 * (2097151 & h2) + (h1 >>> 0);

    };

    getCss(): string {
        let content = [];
        for (const mediaQuery in this.styles) {
            content.push(`${mediaQuery}{`);
            for (const selector in this.styles[mediaQuery]) {
                content.push(`\t${selector}{ ${this.styles[mediaQuery][selector]} }`);
            }
            content.push('}');
        }

        return content.join("\n");
    };


    push(styleObject: any, node: null | HTMLElement = null): number[] {
        if (typeof styleObject === 'string') {
            styleObject = JSON.parse(styleObject);
        }

        let hashes: number[] = [];

        for (const key in styleObject) {
            const mediaQuery = this.keyToMediaQuery(key, node),
                style = this.reOrderStyles(styleObject[key]),
                hash = this.hash(`${mediaQuery}:${style}`, this.hashSeed),
                selector = this.options.selectorTemplate(hash);
            this.addStyle(mediaQuery, selector, style);
            hashes.push(hash);
        }

        return hashes;
    }
}
