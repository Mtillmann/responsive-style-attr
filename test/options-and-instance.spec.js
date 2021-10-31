describe('Tests Css Constructor options and methods', function () {
    const
        sandbox = document.createElement('div'),
        xs = '0',
        sm = '576px',
        md = '768px',
        lg = '992px',
        xl = '1200px',
        xxl = '1400px',
        breakpoints = [["xs", xs], ["sm", sm], ["md", md], ["lg", lg], ["xl", xl], ["xxl", xxl]];

    sandbox.innerHTML = `
        <section></section>
        <div id="first" data-rsa-style='{"lg-up@portrait" : "border:1px solid red", "sm-to-lg" : "border:1px solid blue"}'>test</div>
        <div id="second" data-rsa-style='{"lg-up@portrait" : "border:1px solid red", "md-up" : "border:1px solid blue; color: transparent"}'>test</div>
        <div id="third" data-rsa-style='{"lg-up@portrait" : "border:1px solid red", "md-up" : "color: transparent ; border:1px solid blue"}'>test</div>    
        <div id="fourth" data-rsa-style='{"lg-up@landscape" : "border:1px solid red", "md-up" : "color: transparent ; border:1px solid blue"}'>test</div>    
    `;

    document.head.insertAdjacentHTML('beforeend', `
            <style type="text/css">
                html {
                    --breakpoints-default: [["xs","2222px"], ["sm","576px"], ["md","768px"], ["lg","992px"], ["xl","1200px"], ["xxl","1400px"]]; 
                }
            </style>
        `);

    const elements = sandbox.querySelectorAll('div');

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
            selectorTemplate: s => `[data-my-custom-selector${s}="true"]`,
            selectorPropertyAttacher: (node, hash) => {
                node.dataset[`myCustomSelector${hash}`] = "true";
            }
        }), firstInfo = css.add(elements[0]);
        css.deployStyleSheet();

        expect(elements[0].matches( firstInfo[0].selector )).toBe(true);
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

    it('picks up new nodes from dom upon refresh', function(){
        const css = new RespStyleAttr.Css();
        document.body.insertAdjacentHTML('beforeend', `
           <div id="refresh1" data-rsa-style='{"lg-up@portrait" : "border:1px solid red", "sm-to-lg" : "border:1px solid blue"}'></div>
        `);

        css.refresh();
        const element = document.getElementById('refresh1');
        return expect(element.matches('[data-rsa-is-processed]')).toBe(true);
    });

    it('does not pick up nodes from dom that have been processed', function(){
        const css = new RespStyleAttr.Css(),
            nodes = css.refresh();

        return expect(nodes.length).toBe(0);
    });

    it('picks up new nodes from dom upon refresh for non default options', function(){
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

    it('ignores already processed nodes for non default options', function(){
        const css = new RespStyleAttr.Css({
            breakpointKey: 'non-default'
        });

        const nodes = css.refresh();

        const element = document.getElementById('refresh1');
        return expect(nodes.length).toBe(0);
    });

    //todo check handling of prepend mediatype

});