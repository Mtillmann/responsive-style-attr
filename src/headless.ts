import {Css} from "./css";
import {emitDebugMessage} from "./debugMessage";

class Headless extends Css {

    constructor(options: any = {}) {

        super(Object.assign({
            ignoreDOM: true,
            selectorTemplate: (s: any): string => `[data-rsa-${s}]`,
            selectorPropertyAttacher: (hash: string) => `data-rsa-${hash}`
        }, options || {}));
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

            let attributes = this.push(styleObject).map(hash => this.options.selectorPropertyAttacher(hash));

            return (string + ' ' + attributes.join(' ')).trim();
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