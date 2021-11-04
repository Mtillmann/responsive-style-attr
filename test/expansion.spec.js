describe("Key To Media Query Expansion", function () {
    const xs = '0',
        sm = '576px',
        md = '768px',
        lg = '992px',
        xl = '1200px',
        xxl = '1400px',
        breakpoints = [["xs", xs], ["sm", sm], ["md", md], ["lg", lg], ["xl", xl], ["xxl", xxl]],
        userAgent = 'Mozilla/5.0 (Linux; Android 11; SM-A102U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Mobile Safari/537.36',
        Css = new RespStyleAttr.Css({
            breakpointKey: 'testing_key_expansion',
            breakpoints,
            ignoreDOM: true,
            features: {
                alwaysTrue: function (mediaQuery) {
                    mediaQuery.media = 'all'
                },
                alwaysFalse: function (mediaQuery) {
                    mediaQuery.media = 'none'
                },
                simpleValue: function (mediaQuery, simpleArg) {
                    mediaQuery['simple-value'] = simpleArg;
                },
                complexValue: function (mediaQuery, complexArg) {
                    mediaQuery['complex-value'] = complexArg.split(',').map(v => Number(v.trim())).reduce((a, b) => a + b);
                },
                androidOnly: function (mediaQuery) {
                    if (!/android/i.test(userAgent)) {
                        mediaQuery.media = 'none';
                    }
                },
                uaMustMatch: function (mediaQuery, input) {
                    const re = new RegExp(input, 'i');
                    if (!re.test(userAgent)) {
                        mediaQuery.media = 'none';
                    }
                },
                wkmdpr: function (mediaQuery, devicePixelRatio) {
                    mediaQuery['-webkit-min-device-pixel-ratio'] = devicePixelRatio;
                },
                keyValue: function (mediaQuery, args) {
                    const [key, value] = args.split(',');
                    mediaQuery[key] = value;
                },
                set: function (mediaQuery, feature) {
                    mediaQuery[feature] = true;
                },
                unset: function (mediaQuery, feature) {
                    mediaQuery[feature] = false;
                }
            }
        })
        substractedMaxValue = input => {
            let value = parseFloat(input),
                unit = input.replace(String(value),'');

            return (value - RespStyleAttr.defaultOptions.classicMinMaxSubtract) + unit;
        },
        keysToExpand = [
            ['lt-md', `@media all and (min-width: ${xs}) and (max-width: ${substractedMaxValue(sm)})`],
            ['xs', `@media all and (min-width: ${xs}) and (max-width: ${substractedMaxValue(sm)})`],
            ['sm', `@media all and (min-width: ${sm}) and (max-width: ${substractedMaxValue(md)})`],
            ['md', `@media all and (min-width: ${md}) and (max-width: ${substractedMaxValue(lg)})`],
            ['lg', `@media all and (min-width: ${lg}) and (max-width: ${substractedMaxValue(xl)})`],
            ['xl', `@media all and (min-width: ${xl}) and (max-width: ${substractedMaxValue(xxl)})`],
            ['xxl', `@media all and (min-width: ${xxl})`],
            ['md@portrait', `@media all and (min-width: ${md}) and (max-width: ${substractedMaxValue(lg)}) and (orientation: portrait)`],
            ['md@ portrait ', `@media all and (min-width: ${md}) and (max-width: ${substractedMaxValue(lg)}) and (orientation: portrait)`],
            ['md@landscape', `@media all and (min-width: ${md}) and (max-width: ${substractedMaxValue(lg)}) and (orientation: landscape)`],
            ['md@  landscape    ', `@media all and (min-width: ${md}) and (max-width: ${substractedMaxValue(lg)}) and (orientation: landscape)`],
            ['md ', `@media all and (min-width: ${md}) and (max-width: ${substractedMaxValue(lg)})`],
            ['     md', `@media all and (min-width: ${md}) and (max-width: ${substractedMaxValue(lg)})`],
            ['     @md@', `@media all and (min-width: ${md}) and (max-width: ${substractedMaxValue(lg)})`],
            ['   @@@@md@md ', `@media all and (min-width: ${md}) and (max-width: ${substractedMaxValue(lg)})`],
            ['   @@md@  @ landscape ', `@media all and (min-width: ${md}) and (max-width: ${substractedMaxValue(lg)}) and (orientation: landscape)`],
            ['screen   @@md@  @ landscape ', `@media screen and (min-width: ${md}) and (max-width: ${substractedMaxValue(lg)}) and (orientation: landscape)`],
            ['screen@md', `@media screen and (min-width: ${md}) and (max-width: ${substractedMaxValue(lg)})`],
            ['screen@md@portrait', `@media screen and (min-width: ${md}) and (max-width: ${substractedMaxValue(lg)}) and (orientation: portrait)`],
            ['xs-to-sm', `@media all and (min-width: ${xs}) and (max-width: ${substractedMaxValue(sm)})`],
            ['sm-to-md', `@media all and (min-width: ${sm}) and (max-width: ${substractedMaxValue(md)})`],
            ['md-to-lg', `@media all and (min-width: ${md}) and (max-width: ${substractedMaxValue(lg)})`],
            ['lg-to-xl', `@media all and (min-width: ${lg}) and (max-width: ${substractedMaxValue(xl)})`],
            ['xl-to-xxl', `@media all and (min-width: ${xl}) and (max-width: ${substractedMaxValue(xxl)})`],
            ['xxl-to-GARBLED', '@media all'],
            ['xs-to-md', `@media all and (min-width: ${xs}) and (max-width: ${substractedMaxValue(md)})`],
            ['sm-to-xl', `@media all and (min-width: ${sm}) and (max-width: ${substractedMaxValue(xl)})`],
            ['md-to-xxl', `@media all and (min-width: ${md}) and (max-width: ${substractedMaxValue(xxl)})`],
            ['xs-down', `@media all and (max-width: ${substractedMaxValue(xs)})`],
            ['sm-down', `@media all and (max-width: ${substractedMaxValue(sm)})`],
            ['md-down', `@media all and (max-width: ${substractedMaxValue(md)})`],
            ['lg-down', `@media all and (max-width: ${substractedMaxValue(lg)})`],
            ['xl-down', `@media all and (max-width: ${substractedMaxValue(xl)})`],
            ['xxl-down', `@media all and (max-width: ${substractedMaxValue(xxl)})`],
            ['xs-up', `@media all and (min-width: ${xs})`],
            ['sm-up', `@media all and (min-width: ${sm})`],
            ['md-up', `@media all and (min-width: ${md})`],
            ['lg-up', `@media all and (min-width: ${lg})`],
            ['xl-up', `@media all and (min-width: ${xl})`],
            ['xxl-up', `@media all and (min-width: ${xxl})`],
            ['1000px', '@media all and (min-width: 1000px)'],
            ['1000px-up', '@media all and (min-width: 1000px)'],
            ['1000px-down', `@media all and (max-width: ${substractedMaxValue("1000px")})`],
            ['500px-to-666px', `@media all and (min-width: 500px) and (max-width: ${substractedMaxValue("666px")})`],
            ['600px-to-800px', `@media all and (min-width: 600px) and (max-width: ${substractedMaxValue("800px")})`],
            ['lg-to-1680px', `@media all and (min-width: ${lg}) and (max-width: ${substractedMaxValue("1680px")})`],
            ['255px-to-500px@portrait', `@media all and (min-width: 255px) and (max-width: ${substractedMaxValue("500px")}) and (orientation: portrait)`],
            ['255px-to-lg', `@media all and (min-width: 255px) and (max-width: ${substractedMaxValue(lg)})`],
            ['landscape', '@media all and (orientation: landscape)'],
            ['@screen, print@sm-up@landscape', '@media screen, print and (min-width: 576px) and (orientation: landscape)'],
            ['@not screen, print@sm-up@landscape', '@media not screen, print and (min-width: 576px) and (orientation: landscape)'],
            ['@not screen, print@xxl@landscape', '@media not screen, print and (min-width: 1400px) and (orientation: landscape)'],
            ['@xs', `@media all and (min-width: 0) and (max-width: ${substractedMaxValue("576px")})`],
            ['@print,screen@xs', `@media print,screen and (min-width: 0) and (max-width: ${substractedMaxValue("576px")})`],
            ['1000px@simpleValue(2)', '@media all and (min-width: 1000px) and (simple-value: 2)'],
            ['1000px@alwaysTrue', '@media all and (min-width: 1000px)'],
            ['1000px@alwaysFalse', '@media none and (min-width: 1000px)'],
            ['1000px@complexValue(1,2,3,4)', '@media all and (min-width: 1000px) and (complex-value: 10)'],
            ['1000px@non-existing(1,2,3,4)', '@media all and (min-width: 1000px)'],
            ['1000px@androidOnly', '@media all and (min-width: 1000px)'],
            ['1000px@uaMustMatch(android)', '@media all and (min-width: 1000px)'],
            ['1000px@uaMustMatch(ios)', '@media none and (min-width: 1000px)'],
            ['wkmdpr(2)', '@media all and (-webkit-min-device-pixel-ratio: 2)'],
            ['keyValue(min-resolution,2dppx)', '@media all and (min-resolution: 2dppx)'],
            ['set(prefers-reduced-motion)', '@media all and (prefers-reduced-motion)'],
            ['unset(prefers-reduced-motion)', '@media all'],
            ['set(prefers-reduced-motion)@,@set(prefers-reduced-data)', '@media all and (prefers-reduced-motion), all and (prefers-reduced-data)'],
            ['keyValue(-webkit-min-device-pixel-ratio,2)@,@keyValue(min-resolution,2dppx)', '@media all and (-webkit-min-device-pixel-ratio: 2), all and (min-resolution: 2dppx)'],
        ];

    for (let i = 0; i < keysToExpand.length; i++) {
        it(`expands key "${keysToExpand[i][0]}" to media query "${keysToExpand[i][1]}"`, function () {
            expect(keysToExpand[i][1]).toBe(Css.keyToMediaQuery(keysToExpand[i][0]));
        });
    }

})
;
