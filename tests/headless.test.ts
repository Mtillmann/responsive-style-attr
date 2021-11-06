/**
 * maybe use jest instead of karma... use:
 * ----@-----jest-environment jsdom
 * //remove dashes
 */
import {Headless} from "../src/headless";

describe('headless usage', function () {

    it('initializes utilizing default params', () => {
        const instance = new Headless();
        expect(instance.options.ignoreDOM).toBe(true);
    });

    it('parses responsive style from single element fragment', () => {
        const instance = new Headless({
                breakpointKey: Math.random()
            }),
            result = instance.parse(`<div data-rsa-style='{"lt-400px":"border: 1px solid #000"}'></div>`)

        expect(result).toMatch(/data-rsa-\d+/);
    });


    it('parses responsive style from element fragment containing multiple elements', () => {
        const instance = new Headless({
                breakpointKey: Math.random()
            }),
            result = instance.parse(`
                   <div data-rsa-style='{"lt-400px":"border: 1px solid #000"}'></div>
                   <div data-rsa-style='{"lt-600px@gt-400px":"border: 1px solid #f00"}'></div>
                   <div data-rsa-style='{"gte-900px":"border: 1px solid #00f"}'></div>
                   <div data-rsa-style='{"lt-200px":"border: 1px solid #0f0"}'></div>
            `);

        expect(result.match(/data-rsa-\d+/g).length).toEqual(4);
    });

    it('removes the initial style attribute when remove arg is passed', () => {
        const instance = new Headless({
                breakpointKey: Math.random()
            }),
            result = instance.parse(`<div data-rsa-style='{"lt-400px":"border: 1px solid #000"}'></div>`, true)

        expect(result.match(/data-rsa-style/)).toBeNull();
    });


    it('removes the initial style attribute when removeDataAttribute option is given', () => {
        const instance = new Headless({
                breakpointKey: Math.random(),
                removeDataAttribute: true
            }),
            result = instance.parse(`<div data-rsa-style='{"lt-400px":"border: 1px solid #000"}'></div>`)

        expect(result.match(/data-rsa-style/)).toBeNull();
    });

    it('yields the same selector for duplicate keys', () => {
        const instance = new Headless({
                breakpointKey: Math.random()
            }),
            result = instance.parse(`
                   <div data-rsa-style='{"lt-400px":"border: 1px solid #000"}'></div>
                   <div data-rsa-style='{"lt-400px":"border: 1px solid #000"}'></div>
            `),
            re = new RegExp(result.match(/data-rsa-(\d+)/)[0], 'g');

        expect(result.match(re).length).toEqual(2);
    });


    it('attaches multiple selectors according to keys', () => {
        const instance = new Headless({
                breakpointKey: Math.random()
            }),
            result = instance.parse(`
                   <div data-rsa-style='{"lt-400px":"border: 1px solid #000", "gt-400px" : "padding:5px", "portrait" : "margin:20px;"}'></div>
            `);

        expect(result.match(/data-rsa-\d+/g).length).toEqual(3);
    });

    it('generates CSS from matched responsive style attributes', () => {
        const instance = new Headless({
                breakpointKey: Math.random()
            }),
            result = instance.parse(`
                   <div data-rsa-style='{"lt-400px":"border: 1px solid #000", "gt-400px" : "padding:5px", "portrait" : "margin:20px;"}'></div>
            `),
            css = instance.getCss();

        expect(css.match(/\[data-rsa-\d+\]/g).length).toEqual(3);
    });


    it('allows adding more fragments at a later time and yields CSS for all elements', () => {
        const instance = new Headless({
            breakpointKey: Math.random()
        });

        instance.parse(`
                   <div data-rsa-style='{"lt-400px":"border: 1px solid #000", "gt-400px" : "padding:5px", "portrait" : "margin:20px;"}'></div>
            `);
        instance.parse(`
                   <div data-rsa-style='{"lt-200px":"border: 1px solid #000", "gt-444px" : "padding:5px", "landscape" : "margin:20px;"}'></div>
            `);

        let css = instance.getCss();

        expect(css.match(/\[data-rsa-\d+\]/g).length).toEqual(6);
    });

    it('handles borked json gracefully', () => {
        const instance = new Headless({
            breakpointKey: Math.random()
        });

        instance.parse(`
                   <div data-rsa-style='{"lt-400px "border: 1px solid #000 -, "gt-400px" ; "padding:5px", "portrait" : "margin:20px;"}'></div>
            `);

        let css = instance.getCss();
        expect(css.length).toEqual(0);
    });

    it('applies values from given breakpoints like the browser version does', () => {
        const
            xs = '0',
            sm = '576px',
            md = '768px',
            lg = '992px',
            xl = '1200px',
            xxl = '1400px',
            instance = new Headless({
            breakpointKey: Math.random(),
            breakpoints: [["xs", xs], ["sm", sm], ["md", md], ["lg", lg], ["xl", xl], ["xxl", xxl]]
        });

        instance.parse(`
                   <div data-rsa-style='{"gt-md" : "margin:20px;"}'></div>
            `);

        let css = instance.getCss();

        expect(new RegExp(`min-width: ${md}`).test(css)).toBe(true);
    });

});
