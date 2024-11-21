export const replace_html_tag = (html: string, params: string = ''): string => {

	if (!params) {
		return html;
	}

	// Remove outer parentheses if present
	params = params.replace(/^\((.*)\)$/, '$1');

	// Split into multiple replacements if commas are present
	const replacements = params.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);

    // Create a temporary DOM element
	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = html;

	replacements.forEach((replacement) => {
		let [search, replace] = replacement.split(/(?<!\\):/).map(p => {
			// Remove surrounding quotes
			return p.trim().replace(/^["']|["']$/g, '');
		});
		if(replace) {
			try {
				tempDiv.querySelectorAll(search).forEach(el => {
					if(el.nodeType !== Node.TEXT_NODE) {
						let new_el = document.createElement(replace);
						new_el.innerHTML = el.innerHTML;
						el.replaceWith(new_el);
					};
				});
			} catch(e) {
				
			}
		}
	});
	const ret = tempDiv.innerHTML;
	tempDiv.remove();
	return ret;
}

