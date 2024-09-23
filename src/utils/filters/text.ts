import { debugLog } from '../debug';

export const text = (html: string): string => {
	// Create a temporary DOM element
	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = html;

	return tempDiv.innerText?.trim() || '';
};