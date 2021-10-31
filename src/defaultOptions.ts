export var defaultOptions: any = {
    debug: true,
    breakpointSelector: 'html',
    breakpointKey: 'default',
    selectorTemplate: (s: any): string => `.rsa-${s}`,
    selectorPropertyAttacher: (node: HTMLElement, hash: string) => node.classList.add(`rsa-${hash}`),
    attachStyleNodeTo: 'head',
    scopedStyleNode: true,
    breakpoints : null,
    ignoreDOM: false,
    alwaysPrependMediatype: true
}