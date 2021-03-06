/**
 * @jest-environment jsdom
 */

import * as RespStyleAttr from "../src/main";

describe('Tests Css Constructor options and methods', function () {
    const
        xs = '0',
        sm = '576px',
        md = '768px',
        lg = '992px',
        xl = '1200px',
        xxl = '1400px',
        breakpoints = [["xs", xs], ["sm", sm], ["md", md], ["lg", lg], ["xl", xl], ["xxl", xxl]];

    document.body.insertAdjacentHTML('beforeend', `
        <div id="sandbox">
        <section></section>
            <div id="first" data-rsa-style='{"lg-up@portrait" : "border:1px solid red", "sm-to-lg" : "border:1px solid blue"}'>test</div>
            <div id="second" data-rsa-style='{"lg-up@portrait" : "border:1px solid red", "md-up" : "border:1px solid blue; color: transparent"}'>test</div>
            <div id="third" data-rsa-style='{"lg-up@portrait" : "border:1px solid red", "md-up" : "color: transparent ; border:1px solid blue"}'>test</div>    
            <div id="fourth" data-rsa-style='{"lg-up@landscape" : "border:1px solid red", "md-up" : "color: transparent ; border:1px solid blue"}'>test</div>    
        </div>
    `);

    document.head.insertAdjacentHTML('beforeend', `
            <style type="text/css">
                html {
                    --breakpoints-default: [["xs","2222px"], ["sm","576px"], ["md","768px"], ["lg","992px"], ["xl","1200px"], ["xxl","1400px"]]; 
                }
            </style>
        `);

    const sandbox = document.body.querySelector('#sandbox'),
        elements = sandbox.querySelectorAll('div');

    it('appends the style element to given selector string', function () {
        const styledump = document.createElement('div');
        styledump.setAttribute('id', 'styledump');
        document.body.appendChild(styledump);

        const css = new RespStyleAttr.Css({
            breakpointKey: 'testing_options_append_selector',
            breakpoints,
            ignoreDOM: true,
            attachStyleNodeTo: '#styledump'
        });

        css.add(elements[0]);
        css.deployStyleSheet();
        expect(document.querySelectorAll('#styledump style').length).toBe(1);
    });

    it('appends the style element to given HTMLElement', function () {
        const css = new RespStyleAttr.Css({
            breakpointKey: 'testing_options_append_element',
            breakpoints,
            ignoreDOM: true,
            attachStyleNodeTo: sandbox.querySelector('section')
        });

        css.add(elements[0]);
        css.deployStyleSheet();

        expect(sandbox.querySelectorAll('section style').length).toBe(1);
    });


    it('appends the style element to <head> when option is omitted', function () {
        const css = new RespStyleAttr.Css({
            breakpointKey: 'testing_options_append_default',
            breakpoints,
            ignoreDOM: true,
            attachStyleNodeTo: null
        });

        css.add(elements[0]);
        css.deployStyleSheet();

        expect(document.head.querySelectorAll(`#rsa-stylesheet-${css.hashSeed}`).length).toBe(1);
    });

    it('obeys when the scoped option is used', function () {
        const css = new RespStyleAttr.Css({
            breakpointKey: 'testing_options_scoped_on',
            breakpoints,
            ignoreDOM: true,
            attachStyleNodeTo: null
        });

        css.add(elements[0]);
        css.deployStyleSheet();

        expect(document.head.querySelector(`#rsa-stylesheet-${css.hashSeed}`).getAttribute('scoped')).toBe('');
    });

    it('obeys when the scoped option turned off', function () {
        const css = new RespStyleAttr.Css({
            breakpointKey: 'testing_options_scoped_off',
            breakpoints,
            scopedStyleNode: false,
            ignoreDOM: true
        });

        css.add(elements[0]);
        css.deployStyleSheet();

        expect(document.head.querySelector(`#rsa-stylesheet-${css.hashSeed}`).getAttribute('scoped')).toBe(null);
    });

    it('picks up breakpoints from given selector', function () {
        document.head.insertAdjacentHTML('beforeend', `
            <style type="text/css">
                #bp-test-style {
                    --breakpoints-testing_options_use_bp_selector: [["xs","9999px"], ["sm","576px"], ["md","768px"], ["lg","992px"], ["xl","1200px"], ["xxl","1400px"]]; 
                }
            </style>
        `);

        document.body.insertAdjacentHTML('beforeend', `<div id="bp-test-style"></div>`);

        const css = new RespStyleAttr.Css({
            breakpointSelector: '#bp-test-style',
            breakpointKey: 'testing_options_use_bp_selector',
            ignoreDOM: true
        });

        css.add(elements[0]);
        css.deployStyleSheet();

        expect(css.breakpoints.value('xs')).toBe("9999px");
    });

    it('uses attribute attachment options', function () {
        const css = new RespStyleAttr.Css({
            breakpointKey: 'testing_options_custom_attribute',
            breakpoints,
            scopedStyleNode: false,
            ignoreDOM: true,
            selectorTemplate: s => `[data-my-custom-selector${s}]`,
            selectorPropertyAttacher: (node, hash) => {
                node.dataset[`myCustomSelector${hash}`] = "true";
            }
        });
        css.add(elements[0]);
        css.deployStyleSheet();

        expect(Object.keys(elements[0].dataset).filter(k => /mycu/i.test(k)).length).toBe(2);
    });


    it('fetches breakpoints from DOM when none are given', function () {
        document.head.insertAdjacentHTML('beforeend', `
            <style type="text/css">
                html {
                    --breakpoints-testing_options_pick_bp_from_dom: [["xs","1234px"], ["sm","576px"], ["md","768px"], ["lg","992px"], ["xl","1200px"], ["xxl","1400px"]]; 
                }
            </style>
        `);

        const css = new RespStyleAttr.Css({
            breakpointKey: 'testing_options_pick_bp_from_dom',
            ignoreDOM: true
        });

        expect(css.breakpoints.value('xs')).toBe('1234px');
    });


    it('initializes without any options given', function () {
        const css = new RespStyleAttr.Css();
        expect(css.breakpoints.value('xs')).toBe('2222px');
    });

    it('returns same instance for identical key + selector', function () {
        const css = new RespStyleAttr.Css(),
            secondCss = new RespStyleAttr.Css();
        expect(css).toBe(secondCss);
    });

    it('picks up new nodes from dom upon refresh', function () {
        const css = new RespStyleAttr.Css();
        document.body.insertAdjacentHTML('beforeend', `
           <div id="refresh1" data-rsa-style='{"lg-up@portrait" : "border:1px solid red", "sm-to-lg" : "border:1px solid blue"}'></div>
        `);

        css.refresh();
        const element = document.getElementById('refresh1');
        return expect(element.matches('[data-rsa-is-processed]')).toBe(true);
    });

    it('does not pick up nodes from dom that have been processed', function () {
        const css = new RespStyleAttr.Css(),
            nodes = css.refresh();

        return expect(nodes.length).toBe(0);
    });


    it('deploys styles of nodes after refresh', function () {
        const css = RespStyleAttr.get('default_html');
        document.body.insertAdjacentHTML('beforeend', `
           <div data-rsa-style='{"gt-777px" : "color:green"}'></div>
        `);

        css.refresh();
        return expect(document.getElementById(`rsa-stylesheet-${css.hashSeed}`).innerHTML).toMatch(/777/);
    });

    it('picks up new nodes from dom upon refresh for non default options', function () {
        document.body.insertAdjacentHTML('beforeend', `
            <style type="text/css">
                html {
                    --breakpoints-non-default: [["xs","2222px"], ["sm","576px"], ["md","768px"], ["lg","992px"], ["xl","1200px"], ["xxl","1400px"]]; 
                }
            </style>
           `);
        const css = new RespStyleAttr.Css({
            breakpointKey: 'non-default'
        });

        document.body.insertAdjacentHTML('beforeend', `
            <div id="refresh2" data-rsa-key="non-default" data-rsa-style='{"lg-up@portrait" : "border:1px solid red", "sm-to-lg" : "border:1px solid blue"}'></div>
        `);

        const nodes = css.refresh();

        const element = document.getElementById('refresh1');
        return expect(nodes.length).toBe(1);
    });

    it('ignores already processed nodes for non default options', function () {
        const css = new RespStyleAttr.Css({
            breakpointKey: 'non-default'
        });

        const nodes = css.refresh();

        const element = document.getElementById('refresh1');
        return expect(nodes.length).toBe(0);
    });

    it('creates mql4 query features', function () {
        const css = new RespStyleAttr.Css({
            breakpointKey: 'mql4-test',
            ignoreDOM: true,
            useMQL4RangeContext: true
        });
        expect(css.keyToMediaQuery('lt-500px')).toBe('@media all and (width < 500px)');
    });

    it('applies subtraction', function () {
        const css = new RespStyleAttr.Css({
            breakpointKey: 'subtract-test',
            ignoreDOM: true,
            minMaxSubtract: 5
        });
        expect(css.keyToMediaQuery('lt-500px')).toBe('@media all and (max-width: 495px)');
    });


    it('doesn\'t apply media when not set', function () {
        const css = new RespStyleAttr.Css({
            breakpointKey: 'no-default-media-test',
            ignoreDOM: true,
            alwaysPrependMediatype: false
        });
        expect(css.keyToMediaQuery('500px')).toBe('@media (min-width: 500px)');
    });

    it('dispatches events when stylesheet is deployed', () => {
        document.body.insertAdjacentHTML('beforeend', `
            <div data-rsa-key="event-test" data-rsa-style='{"gt-500px":"color:blue"}'></div>
        `);

        let eventHit = false;

        document.documentElement.addEventListener('rsa:cssdeployed', (e) => {
            eventHit = true;
        })

        new RespStyleAttr.Css({
            breakpointKey: 'event-test'
        });

        expect(eventHit).toBeTruthy();
    })

});