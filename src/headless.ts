import {Css} from "./css";
import {emitDebugMessage} from "./debugMessage";

class Headless extends Css {

    constructor(options: any = {}) {

        super(Object.assign({
            ignoreDOM: true,
            selectorTemplate: (s: any): string => `[data-rsa-${s}]`,
            selectorPropertyAttacher: (node: null, hash: string) => `data-rsa-${hash}`
        }, options || {}));
    };

    push(styleObject: any): string[] {
        if (typeof styleObject === 'string') {
            styleObject = JSON.parse(styleObject);
        }

        let attributes:string[] = [];

        for (const key in styleObject) {
            const mediaQuery = this.keyToMediaQuery(key),
                style = this.reOrderStyles(styleObject[key]),
                hash = this.hash(`${mediaQuery}:${style}`, this.hashSeed),
                selector = this.options.selectorTemplate(hash),
                attribute = this.options.selectorPropertyAttacher(null, hash);

            this.addStyle(mediaQuery, selector, style);
            attributes.push(attribute);
        }

        return attributes;
    };

    parse(html: string, remove: boolean = false) {
        html = html.replace(/data-rsa-style='(\{.*\})'/g, (string, json) => {
            let styleObject: any = {};
            try {
                styleObject = JSON.parse(json);
            } catch (e) {
                emitDebugMessage(`JSON.parse failed on: "${json}"`)
                return string;
            }

            if (remove || this.options.removeDataAttribute) {
                string = '';
            }

            return (string + ' ' + this.push(styleObject).join(' ')).trim();
        });

        return html;
    }


    getStyleSheet(): string {
        return `<style type="text/css" id="rsa-stylesheet-${this.hashSeed}"${this.options.scopedStyleNode ? ' scoped' : ''}>
${this.getCss()}
</style>
`;

    }
}

export {
    Headless
}