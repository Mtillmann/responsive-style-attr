import {Css} from "./css";
import {emitDebugMessage} from "./debugMessage";

class Static extends Css {

    constructor(options: any = {}) {

        super(Object.assign({
            ignoreDOM: true,
            selectorTemplate: (s: any): string => `[data-rsa-${s}]`,
            selectorPropertyAttacher: (node: null, hash: string) => `data-rsa-${hash}="1"`
        }, options || {}));

    }


    parse(html: string, remove: boolean = false) {
        html = html.replace(/data-rsa-style='(\{.*\})'/g, (string, json) => {

            try{
                const styleObject = JSON.parse(json);
            }catch(e){
                emitDebugMessage(`JSON.parse failed on: "${json}"`)
                return string;
            }

            if (remove || this.options.removeDataAttribute) {
                string = '';
            }

            for (const key in styleObject) {
                const mediaQuery = this.keyToMediaQuery(key),
                    style = this.reOrderStyles(styleObject[key]),
                    hash = this.hash(`${mediaQuery}:${style}`, this.hashSeed),
                    selector = this.options.selectorTemplate(hash),
                    attribute = this.options.selectorPropertyAttacher(null, hash);

                this.addStyle(mediaQuery, selector, style);

                string += ' ' + attribute;
            }
            return string.trim();
        });

        return html;
    }


    getStyleSheet(): string{

        return `<style type="text/css" id="rsa-stylesheet-${this.hashSeed}"${this.options.scopedStyleNode?' scoped':''}>
${this.getCss()}
</style>
`;

}
}

export {
    Static
}