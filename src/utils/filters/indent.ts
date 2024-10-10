export const indent = (str: string, param?: string): string => {
	let level = 1;
	if (param) {
		// Remove outer quotes if present
		param = param.replace(/^(['"])(.*)\1$/, '$2');
        if(/^\d+$/.test(param)) {
			level = parseInt(param, 10);     
		}
	}
	const indentation = "\t".repeat(level);
	var lines = str.split("\n")
	var result = lines.reduce((acc: string[], line) => {
		acc.push(`${indentation}${line}`);
		return acc;
	}, [])
		
    return result.join("\n");
};