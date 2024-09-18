export const split = (str: string, param?: string): string => {
	if (!param) {
		return JSON.stringify([str]);
	}

	// Remove outer parentheses if present
	param = param.replace(/^\((.*)\)$/, '$1');
	// Remove surrounding quotes (both single and double)
	param = param.replace(/^(['"])(.*)\1$/, '$2');

	// If param is a single character, use it directly
	const separator = param.length === 1 ? param : new RegExp(param);

	// Split operation
	const result = str.split(separator);

	return JSON.stringify(result);
};