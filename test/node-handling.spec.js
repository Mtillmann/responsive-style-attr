describe("Extracting styles from nodes", function () {
    const
        sandbox = document.createElement('div'),
        xs = '0',
        sm = '576px',
        md = '768px',
        lg = '992px',
        xl = '1200px',
        xxl = '1400px',
        breakpoints = [["xs", xs], ["sm", sm], ["md", md], ["lg", lg], ["xl", xl], ["xxl", xxl]],
        css = new RespStyleAttr.Css({
            breakpointKey: 'testing_node_handling',
            breakpoints,
            ignoreDOM: true,
            attachStyleNodeTo: sandbox
        });

    sandbox.innerHTML = `
        <div id="first" data-rsa-style='{"lg-up@portrait" : "border:1px solid red", "sm-to-lg" : "border:1px solid blue"}'>test</div>
        <div id="second" data-rsa-style='{"lg-up@portrait" : "border:1px solid red", "md-up" : "border:1px solid blue; color: transparent"}'>test</div>
        <div id="third" data-rsa-style='{"lg-up@portrait" : "border:1px solid red", "md-up" : "color: transparent ; border:1px solid blue"}'>test</div>    
        <div id="fourth" data-rsa-style='{"lg-up@landscape" : "border:1px solid red", "md-up" : "color: transparent ; border:1px solid blue"}'>test</div>    
    `;

    const elements = sandbox.querySelectorAll('div');

    it('yields same hash for multiple add of same element', function () {
        const node = elements[0];
        expect(css.add(node)['hash']).toBe(css.add(node)['hash'])
    });

    it('extracts key from attribute', function () {
        const node = elements[0],
            info = css.add(node);
        expect(info[0].key).toBe('lg-up@portrait')
    });

    it('yields the same hash for two elements with equal mediaquery and style', function () {
        const first = elements[0],
            second = elements[1],
            firstInfo = css.add(first),
            secondInfo = css.add(second);
        expect(firstInfo[0].hash).toBe(secondInfo[0].hash)
    });


    it('yields the same hash for two elements with equal mediaquery and differently ordered style', function () {
        const second = elements[1],
            third = elements[2],
            secondInfo = css.add(second),
            thirdInfo = css.add(third);
        expect(secondInfo[0].hash).toBe(thirdInfo[0].hash)
    });

    it('yields style node', function (){
        css.deployStyleSheet();
        const stylesheets = sandbox.querySelectorAll('style');
        expect(stylesheets.length).toBe(1)
    });


    it('does not create new style node after deploy', function (){
        css.deployStyleSheet();
        const stylesheets = sandbox.querySelectorAll('style');
        expect(stylesheets.length).toBe(1)
    });


    it('updates existing style after add and deploy', function (){
        const currentCss = sandbox.querySelector('style').innerHTML;
        css.add(elements[3]);
        css.deployStyleSheet();
        expect(sandbox.querySelector('style').innerHTML).not.toBe(currentCss);
    });


    it('doesn\'t update existing style after repeat deploy', function (){
        const currentCss = sandbox.querySelector('style').innerHTML;
        css.deployStyleSheet();
        expect(sandbox.querySelector('style').innerHTML).toBe(currentCss);
    });

    it('contains generated selectors', function (){
        const currentCss = sandbox.querySelector('style').innerHTML,
            firstInfo = css.add(elements[0]);
        expect(currentCss).toContain(firstInfo[0].selector);
    });

    it('contains generated mediaqueries', function (){
        const currentCss = sandbox.querySelector('style').innerHTML,
            firstInfo = css.add(elements[0]);
        expect(currentCss).toContain(firstInfo[0].mediaQuery);
    });
});
