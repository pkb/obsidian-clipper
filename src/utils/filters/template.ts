import { debugLog } from '../debug';
import { applyFilters } from '../filters';

export const template = (input: string | any[], param?: string): string => {
	debugLog('Template', 'Template input:', input);
	debugLog('Template', 'Template param:', param);

	if (!param) {
		debugLog('Template', 'No param provided, returning input');
		return typeof input === 'string' ? input : JSON.stringify(input);
	}

	// Remove outer parentheses if present
	param = param.replace(/^\((.*)\)$/, '$1');
	// Remove surrounding quotes (both single and double)
	param = param.replace(/^(['"])(.*)\1$/, '$2');

	let obj: any[] = [];
	if (typeof input === 'string') {
		try {
			obj = JSON.parse(input);
			debugLog('Template', 'Parsed input:', obj);
		} catch (error) {
			debugLog('Template', 'Parsing failed, using input as is');
			obj = [input];
		}
	} else {
		obj = input;
	}

	// Ensure obj is always an array
	obj = Array.isArray(obj) ? obj : [obj];

	debugLog('Template', 'Object to process:', obj);

	const result = obj.map(item => replaceTemplateVariables(item, param)).join('\n\n');
	debugLog('Template', 'Processing result:', result);
	return result;
};

function decodeHtmlEntities(str: string): string {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
}

function replaceTemplateVariables(obj: any, template: string): string {
	debugLog('Template', 'Replacing template variables for:', obj);
	debugLog('Template', 'Template:', template);

	// If obj is a string that looks like an object, try to parse it
	if (typeof obj === 'string') {
		try {
			obj = parseObjectString(obj);
			debugLog('Template', 'Parsed object:', obj);
		} catch (error) {
			debugLog('Template', 'Failed to parse object string:', obj);
		}
	}

	let result = template.replace(/\$\{([\w.\[\]]+)(?:\|(.*?))?\}/g, (match, path, filterString) => {
		debugLog('Template', 'Replacing:', match);
		let value = getNestedProperty(obj, path);
		if(filterString) {
			value = applyFilters(value, filterString);
		}
		debugLog('Template', 'Replaced with:', value);
		return value !== undefined && value !== 'undefined' ? value : '';
	});

	// Handle the case where obj is a simple string (from string literal in map)
	if (typeof obj === 'object' && obj.str) {
		result = result.replace(/\$\{str\}/g, obj.str);
	}

	debugLog('Template', 'Result after variable replacement:', result);

	// Replace \n with actual newlines
	result = result.replace(/\\n/g, '\n');
	debugLog('Template', 'Result after newline replacement:', result);
        result = decodeHtmlEntities(result);

	// Remove any empty lines (which might be caused by undefined values)
	result = result.split('\n').filter(line => line.trim() !== '').join('\n');
	debugLog('Template', 'Result after empty line removal:', result);

	return result.trim();
}

function parseObjectString(str: string): any {
	const obj: any = {};
	const regex = /(\w+):\s*("(?:\\.|[^"\\])*"|[^,}]+)/g;
	let match;

	while ((match = regex.exec(str)) !== null) {
		let [, key, value] = match;
		// Remove quotes from the value if it's a string
		if (value.startsWith('"') && value.endsWith('"')) {
			value = value.slice(1, -1);
		}
		obj[key] = value === 'undefined' ? undefined : value;
	}

	return obj;
}

function getNestedProperty(obj: any, path: string): any {
	debugLog('Map', 'Getting nested property:', { obj: JSON.stringify(obj), path });
	const result = path.split(/[\.\[\]]/).filter(Boolean).reduce((current, key) => {
		if (current && Array.isArray(current) && /^\d+$/.test(key)) {
			return current[parseInt(key, 10)];
		}
		return current && current[key] !== undefined ? current[key] : undefined;
	}, obj);
	debugLog('Map', 'Nested property result:', result);
	return result;
}
