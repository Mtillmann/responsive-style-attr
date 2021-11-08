/**
 * @jest-environment jsdom
 */

import * as RespStyleAttr from "../src/main";


describe('helpers and such', function () {

    it('attaches new instances to the internal instance map', function () {
        const currentInstances = Object.entries(RespStyleAttr.get()).length;
        new RespStyleAttr.Css({breakpointKey: 'instance_add_test'});

        expect(Object.entries(RespStyleAttr.get()).length).toBe(currentInstances + 1)
    });


    it('picks up elements from dom via init', function () {
        const currentInstances = Object.entries(RespStyleAttr.get()).length;
        document.body.insertAdjacentHTML('beforeend', `
            <style>
                html{
                    --breakpoints-global_init_helper: var(--breakpoints-default);
                }            
            </style>
            <div id="inittest" data-rsa-key="global_init_helper" data-rsa-style='{"lg-up@portrait" : "border:1px solid red", "sm-to-lg" : "border:1px solid blue"}'></div>
        `);


        RespStyleAttr.init();

        expect(document.getElementById('inittest').dataset.rsaIsProcessed).toBe('true')
    });

    it('ignores broken breakpoints json and fails silently / logs to console', function () {
        document.body.insertAdjacentHTML('beforeend', `
            <style>
                html{
                    --breakpoints-borked-json: '[,something,, ]]] that will not parse';
                }            
            </style>
        `);

        const css = new RespStyleAttr.Css({breakpointKey: 'borked-json'});
        expect(css.breakpoints.breakpoints[0][0]).toBe('undefined');
    });

})