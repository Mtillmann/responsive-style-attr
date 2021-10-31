import {defaultOptions} from "./defaultOptions";

export function emitDebugMessage(data: {}, type = 'info') {
    if (defaultOptions.debug) {
        (console as any)[type]('ResponsiveStyleAttributes DEBUG:', data);
    }
}