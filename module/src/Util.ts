export class Util {
    public static toFixed(number: number | string, precision: number = 0): number {
        let pow = Math.pow(10, precision);
        return (Math.round((number as number) * pow) / pow);
    }
}
