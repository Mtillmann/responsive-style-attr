export var defaultOptions: any = {
    debug: false,
    breakpointSelector: 'html',
    breakpointKey: 'default',
    selectorTemplate: (s: any): string => `.rsa-${s}`,
    selectorPropertyAttacher: (node: HTMLElement, hash: string) => node.classList.add(`rsa-${hash}`),
    attachStyleNodeTo: 'head',
    scopedStyleNode: true,
    breakpoints : null,
    ignoreDOM: false,
    alwaysPrependMediatype: true,
    minMaxSubtract : 0.02,
    useMQL4RangeContext : false,
    removeDataAttribute : false
}