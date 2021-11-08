import {emitDebugMessage} from "./debugMessage";

export class Breakpoints {
    breakpoints: Array<Array<any>> = [['undefined', '0px']];
    breakpointMap: any = {};
    keyMap: string[] = [];
    selector: string;
    key: string;
    regexps: { [key: string]: RegExp; } = {};
    options: any;

    constructor(options: any = {}) {
        this.options = options;
        this.selector = this.options.breakpointSelector;
        this.key = this.options.breakpointKey;


        this.getBreakpoints();
    }

    index(key: string) {
        return this.keyMap.indexOf(key);
    };

    next(key: string): any[] {
        return this.breakpoints[this.index(key) + 1];
    };

    value(key: string) {
        return this.breakpointMap[key] || null;
    };

    test(keyToTest: string): boolean {
        return this.regexps.test.test(keyToTest);
    };

    processKey(mediaQuery: any, keyToParse: string) {
        const isOnly = this.regexps.isOnly.test(keyToParse),
            isGT = this.regexps.isGT.test(keyToParse),
            isLT = this.regexps.isLT.test(keyToParse),
            isBetween = this.regexps.isBetween.test(keyToParse),
            usesOnlyBreakpointKeys: RegExpExecArray | null = this.regexps.usesOnlyBreakpointKeys.exec(keyToParse),
            usesMixedValues: RegExpExecArray | null = this.regexps.usesMixedValues.exec(keyToParse),
            compareEquality: boolean = /^\wte/.test(keyToParse);

        //todo dont run all regexps at once
        //todo implement run order in options

        let upper: string | null = null,
            lower: string | null = null;

        if (usesMixedValues!) {
            if (usesMixedValues[1] && usesMixedValues[2]) {
                lower = this.value(usesMixedValues[1]);
                upper = usesMixedValues[2];
            } else if (usesMixedValues[3] && usesMixedValues[4]) {
                lower = usesMixedValues[3];
                upper = this.value(usesMixedValues[4]);
            }
        } else if (usesOnlyBreakpointKeys!) {
            let first: string = usesOnlyBreakpointKeys[1],
                second: string = usesOnlyBreakpointKeys[2];

            lower = this.value(first);

            if (isOnly) {
                let next = this.next(first);
                if (next) {
                    //if the largest is used, there is no "next" use as max-width
                    upper = next[1];
                }
            } else if (isLT) {
                upper = lower;
                lower = null;
            } else if (isBetween) {
                upper = this.value(second);
            }

        } else {

            let actualBreakpoints: RegExpExecArray | null = this.regexps.actualBreakpoints.exec(keyToParse);

            if (actualBreakpoints!) {
                if (isBetween) {
                    lower = actualBreakpoints[1];
                    upper = actualBreakpoints[2];
                } else if (isLT) {
                    upper = actualBreakpoints[3];
                } else if (isGT) {
                    lower = actualBreakpoints[3];
                } else {
                    lower = actualBreakpoints[0];
                }
            }
        }

        if (this.options.useMQL4RangeContext) {
            if (lower && upper) {
                mediaQuery[':mql4rc'] = `${lower} < width < ${upper}`;
            } else if (lower) {
                mediaQuery[':mql4rc'] = `width >${compareEquality ? '=' : ''} ${lower}`;
            } else if (upper) {
                mediaQuery[':mql4rc'] = `width <${compareEquality ? '=' : ''} ${upper}`;
            }
        } else {

            if (lower) {
                let value = parseFloat(lower),
                    unit = lower.replace(String(value), '');

                if (compareEquality) {
                    value -= this.options.minMaxSubtract;
                }

                mediaQuery['min-width'] = value + unit;
            }
            if (upper) {
                let value = parseFloat(upper),
                    unit = upper.replace(String(value), '');

                if (!compareEquality) {
                    value -= this.options.minMaxSubtract;
                }

                mediaQuery['max-width'] = value + unit;
            }
        }

    };

    getBreakpoints() {
        let computedStyle,
            breakpointDefinition,
            propertyName = `--breakpoints-${this.key}`,
            keys: string[] = [];


            if (this.options.breakpoints) {
                this.breakpoints = this.options.breakpoints;
            } else if(typeof window !== 'undefined') {
                computedStyle = getComputedStyle(document.querySelector(this.selector) || document.documentElement);
                breakpointDefinition = computedStyle.getPropertyValue(propertyName);
                if (!breakpointDefinition) {
                    emitDebugMessage(`No JSON breakpoint definition found for "${this.selector} { ${propertyName}: ... ; }"`, 'error')
                }
                try {
                    this.breakpoints = JSON.parse(breakpointDefinition);
                } catch (error: any) {
                    emitDebugMessage(`JSON.parse failed for breakpoint definition of "${this.selector} { ${propertyName}: ... ; }": ${error.message}`, 'error')
                    emitDebugMessage(`JSON given "${breakpointDefinition}"`, 'error')
                    this.breakpoints = [['undefined', '0px']];
                }
                if (!(this.breakpoints instanceof Array)) {
                    emitDebugMessage('JSON parse of given breakpoints did not yield expected array in format [["key", "value"], ...]');
                    this.breakpoints = [['undefined', '0px']];
                }
            }


        this.breakpoints.forEach((item: any) => {
            this.keyMap.push(item[0]);
            this.breakpointMap[item[0]] = item[1]
            keys.push(item[0]);
        });


        let keysOnlyString = keys.join('|'),
            keysAndValuesString = keysOnlyString + '|\\d+\\w{2,3}';

        this.regexps = {
            test: new RegExp(`^([lg]te?-?)?(${keysAndValuesString})(-(to|up|down)-?)?(${keysAndValuesString})?$`),
            isOnly: new RegExp(`^(${keysOnlyString})$`),
            isGT: new RegExp(`^(gte?-(${keysAndValuesString}))|((${keysAndValuesString})\-up)$`),
            isLT: new RegExp(`^(lte?-(${keysAndValuesString}))|((${keysAndValuesString})\-down)$`),
            isBetween: new RegExp(`^(${keysAndValuesString})-to-(${keysAndValuesString})$`),
            actualBreakpoints: new RegExp('^(?:(\\d+\\w{2,3})-to-(\\d+\\w{2,3})|(?:(?:\\wte?-)?(\\d+\\w{2,3}))(?:-\\w{2,4})?)$'),
            usesOnlyBreakpointKeys: new RegExp(`^(?:[lg]te?-?)?(${keysOnlyString})(?:-(?:to|up|down)-?)?(${keysOnlyString})?$`),
            usesMixedValues: new RegExp(`^(?:(${keysOnlyString})-to-(\\d+\\w{2,3})|(\\d+\\w{2,3})-to-(${keysOnlyString}))$`),
        };


        return this.breakpoints;
    }
}
