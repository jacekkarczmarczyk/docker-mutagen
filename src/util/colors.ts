const colorsEnabled = process.stdout.isTTY && !process.env.NO_COLOR;

function paint (code: string, text: string): string {
  return colorsEnabled ? `\x1b[${code}m${text}\x1b[0m` : text;
}

export const green = (text: string): string => paint('32', text);
export const yellow = (text: string): string => paint('33', text);
export const red = (text: string): string => paint('31', text);
export const gray = (text: string): string => paint('90', text);
export const bold = (text: string): string => paint('1', text);
