import {Css, instances} from "./css";
import {defaultOptions} from "./defaultOptions";

const init = function (options: any = {}) {
        let nodes = document.querySelectorAll('[data-rsa-key]:not([data-rsa-is-processed]), [data-rsa-selector]:not([data-rsa-is-processed])'),
            defaultKeyAndSelector = `${defaultOptions.breakpointKey}_${defaultOptions.breakpointSelector}`;

        if (!(defaultKeyAndSelector in instances)) {
            instances[defaultKeyAndSelector] = new Css(options);
        }

        for (let i = 0; i < nodes.length; i++) {
            let dataset = (nodes[i] as HTMLElement).dataset,
                breakpointKey = dataset.rsaKey || defaultOptions.breakpointKey,
                breakpointSelector = dataset.rsaSelector || defaultOptions.breakpointSelector;

            if (!instances.hasOwnProperty(`${breakpointKey}_${breakpointSelector}`)) {
                new Css({breakpointSelector, breakpointKey});
            }
        }
    },

    refresh = function () {
        for (const key in instances) {
            instances[key].refresh();
        }
    },

    get = function (key?: string): Css | null {
        if (key) {
            return instances[key] || null;
        }
        return instances;
    };

export {
    Css,
    init,
    refresh,
    get,
    defaultOptions
};