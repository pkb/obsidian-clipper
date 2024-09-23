import { debugLog } from '../debug';

export const wrap = (str: string, param?: string): string => {
    let array;
    try {
	array = JSON.parse(str);
	debugLog('wrap', 'Parsed array:', JSON.stringify(array, null, 2));
    } catch (error) {
	debugLog('wrap', 'Parsing failed, using input as single item');
	array = [str];
    }

    if (Array.isArray(array) && param) {
        // Remove outer parentheses if present
        param = param.replace(/^\((.*)\)$/, '$1');

        // Split by comma, but respect both single and double quoted strings
        const params = param.split(/,(?=(?:(?:[^"']*["'][^"']*["'])*[^"']*$))/).map(p => {
        // Trim whitespace and remove surrounding quotes (both single and double)
            return p.trim().replace(/^(['"])(.*)\1$/, '$2');
        });
        let ret: any = [];
        for(let i = 0; i < array.length;) {
             let obj: any = {};
             for(let j = 0; j < params.length && i < array.length; j++) {
                Object.assign(obj, { [`${params[j]}`]: array[i] });
                i++;
             }
             ret.push(obj);
        }
        return JSON.stringify(ret);
    }
    return str;
};