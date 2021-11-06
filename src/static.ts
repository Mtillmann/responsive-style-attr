import {Css} from "./css";

class Static extends Css {
    localDefaultOptions: any = {
        ignoreDOM: true,
        selectorTemplate: (s: any): string => `[data-rsa-${s}]`,
        selectorPropertyAttacher: (node: null, hash: string) => `data-rsa-${hash}="1"`,
    };

    parse(html: string, replace: boolean){
        html = html.replace(/data-rsa-style='(.*)'/g, (a,b,c) => {
console.log(a,b,c)
            return '';
        });
    }

    getCss():String{
        return '';
    }
}

export {
    Static
}