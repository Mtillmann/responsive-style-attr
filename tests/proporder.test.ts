/**
 * @jest-environment jsdom
 */

import * as RespStyleAttr from "../src/main";


describe("Style Property reordering", function () {
    const xs = '0',
        sm = '576px',
        md = '768px',
        lg = '992px',
        xl = '1200px',
        xxl = '1400px',
        breakpoints = [["xs", xs], ["sm", sm], ["md", md], ["lg", lg], ["xl", xl], ["xxl", xxl]],
        Css = new RespStyleAttr.Css({
            breakpointKey: 'testing_proporder',
            breakpoints,
            ignoreDOM: true
        }),
        shouldBeEqual = {
            'border: 1px solid red; outline: none; width: 255px': 'width: 255px; border:1px solid red; outline : none',
            '--var-asdf: "yo"; --var-xyz: "wassup"': ' --var-xyz: "wassup"; --var-asdf: "yo";',
            ';display:flex': ' display   : flex;',
            ';border-color:green; border-color:  blue; border-color: red': 'border-color:red;border-color:green;border-color:blue;'
        };

    for (const [k, v] of Object.entries(shouldBeEqual)) {
        it(`sorts and equalizes "${k}" and "${v}"`, function () {
            expect(Css.reOrderStyles(k)).toBe(Css.reOrderStyles(v));
        });
    }

});
