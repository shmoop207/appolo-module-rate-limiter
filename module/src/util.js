"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Util {
    static toFixed(number, precision = 0) {
        let pow = Math.pow(10, precision);
        return (Math.round(number * pow) / pow);
    }
}
exports.Util = Util;
//# sourceMappingURL=Util.js.map