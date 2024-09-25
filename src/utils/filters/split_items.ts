import { debugLog } from '../debug';

// To avoid conflicts with upstream it is easier to add new filter than modify the existing one.

export const split_items = (str: string, param?: string): string[] => {
	debugLog('split_items', 'input:', str);
	debugLog('split_items', 'param:', param);

	let array;
	try {
		array = JSON.parse(str);
		debugLog('Map', 'Parsed array:', JSON.stringify(array, null, 2));
	} catch (error) {
		debugLog('Map', 'Parsing failed, using input as single item');
		array = [str];
	}

	if (!param) {
             return array;
	}

	// Remove outer parentheses if present
	param = param.replace(/^\((.*)\)$/, '$1');
	// Remove surrounding quotes (both single and double)
	param = param.replace(/^(['"])(.*)\1$/, '$2');

	// If param is a single character, use it directly
	const separator = param.length === 1 ? param : new RegExp(param);

	// Split operation
	return array.map((item: any) => item.toString().split(separator)).flat();
};
