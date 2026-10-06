const colorsEnabled = process.stdout.isTTY && !process.env.NO_COLOR;
function paint(code, text) {
    return colorsEnabled ? `\x1b[${code}m${text}\x1b[0m` : text;
}
export const green = (text) => paint('32', text);
export const yellow = (text) => paint('33', text);
export const red = (text) => paint('31', text);
export const gray = (text) => paint('90', text);
export const bold = (text) => paint('1', text);
//# sourceMappingURL=colors.js.map