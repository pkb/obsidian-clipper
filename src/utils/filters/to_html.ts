
import { debugLog } from '../debug';

function objectsHtmlAttributes(obj: any): string {
    let attributes: any = obj['attributes'];
    let ret: string[] = [];

    for (const [key, value] of Object.entries(attributes)) {
        ret.push(`${key}="${value}"`);
    }
    return ret.join(' ');
}

function objectToHtml(obj: any): string {
    if (Array.isArray(obj)) {
        return obj.reduce((acc, val) => acc + objectToHtml(val), '');
    }
    let ret: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
        if(key === 'text') {
            ret.push(value as string);
        } else if(key !== "attributes") {
            ret.push(`<${key} ${objectsHtmlAttributes(obj)}>${objectToHtml(value)}</${key}>`);
        }
    }
    return ret.join('');
}
export const to_html = (input: string): string => {
    let obj: any;
	if (typeof input === 'string') {
		try {
			obj = JSON.parse(input);
		} catch (error) {
			return input;
		}
	} else {
		obj = input;
	}
    return objectToHtml(obj);
};
