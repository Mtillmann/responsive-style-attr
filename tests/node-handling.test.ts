/**
 * @jest-environment jsdom
 */

import * as RespStyleAttr from "../src/main";


describe("Extracting styles from nodes", function () {
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
        <div id="first" data-rsa-style='{"lg-up@portrait" : "border:1px solid red", "sm-to-lg" : "border:1px solid blue"}'>test</div>
        <div id="second" data-rsa-style='{"lg-up@portrait" : "border:1px solid red", "sm-to-lg" : "border:1px solid blue"}'>test</div>
        <div id="third" data-rsa-style='{"lg-up@portrait" : "border:1px solid red", "md-up" : "border:1px solid blue; color: transparent"}'>test</div>
        <div id="fourth" data-rsa-style='{"lg-up@portrait" : "border:1px solid red", "md-up" : "color: transparent ; border:1px solid blue"}'>test</div>    
        <div id="fifth" data-rsa-style='{"lg-up@landscape" : "border:1px solid red", "md-up" : "color: transparent ; border:1px solid blue"}'>test</div>    
        </div>
    `);

    const sandbox = document.body.querySelector('#sandbox'),
        elements = sandbox.querySelectorAll('div'),
        css = new RespStyleAttr.Css({
            breakpointKey: 'testing_node_handling',
            breakpoints,
            ignoreDOM: true,
            attachStyleNodeTo: sandbox
        });


    it('yields same hash for multiple add of same element', function () {

        expect(css.add(elements[0]).classList.toString()).toBe(css.add(elements[0]).classList.toString())
    });

    it('extracts key from attribute', function () {
        css.add(elements[0])
        const cssText = css.getCss();

        expect(cssText.indexOf(css.keyToMediaQuery('lg-up@portrait'))).toBeGreaterThan(-1);
    });

    it('yields the same hash for two elements with equal mediaquery and style', function () {
        const first = css.add(elements[0]),
            second = css.add(elements[1]);
        expect(first.classList.toString()).toBe(second.classList.toString())
    });


    it('yields the same hash for two elements with equal media query and differently ordered style', function () {
        const first = css.add(elements[2]),
            second = css.add(elements[3]);
        expect(first.classList.toString()).toBe(second.classList.toString())

    });

    it('yields style node', function () {
        css.deployStyleSheet();
        const stylesheets = sandbox.querySelectorAll('style');
        expect(stylesheets.length).toBe(1)
    });


    it('does not create new style node after deploy', function () {
        css.deployStyleSheet();
        const stylesheets = sandbox.querySelectorAll('style');
        expect(stylesheets.length).toBe(1)
    });


    it('updates existing style after add and deploy', function () {
        const currentCss = sandbox.querySelector('style').innerHTML;
        css.add(elements[4]);
        css.deployStyleSheet();
        expect(sandbox.querySelector('style').innerHTML).not.toBe(currentCss);
    });


    it('doesn\'t update existing style after repeat deploy', function () {
        const currentCss = sandbox.querySelector('style').innerHTML;
        css.deployStyleSheet();
        expect(sandbox.querySelector('style').innerHTML).toBe(currentCss);
    });

    it('contains generated selectors', function () {
        const currentCss = sandbox.querySelector('style').innerHTML;

        expect(currentCss.indexOf(elements[0].classList[0])).toBeGreaterThan(0);
    });

    it('removes the "rsa-pending" from processed nodes', () => {
        document.body.insertAdjacentHTML('beforeend', `
             <div class="rsa-pending" data-rsa-key="class-remove-test" data-rsa-style='{"gt-500px":"color:blue"}'></div>
        `);


        new RespStyleAttr.Css({
            breakpointKey: 'class-remove-test'
        });

        const stillHasPendingClass = document.body.querySelector('[data-rsa-key="class-remove-test"]').classList.contains('rsa-pending');

        expect(stillHasPendingClass).not.toBeTruthy();

    })

});
