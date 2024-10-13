import { debugLog } from '../debug';

function nodeChildrenToJson(node: Node, jsonNode: any): any {
    // Recursively process child nodes
    node.childNodes.forEach(child => nodeToJson(child, jsonNode));
}

function nodeToJson(node: Node, jsonNode: any): void {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        jsonNode.push({ "text" : node.textContent.trim() });
        return;
    }

    if (node instanceof Element) {
        const childNode: any = {
            [`${node.nodeName.toLowerCase()}`] : [],
            attributes: {}
        };
        Array.from(node.attributes).forEach(attr => {
            childNode.attributes[attr.name] = attr.value;
        });
        nodeChildrenToJson(node, childNode[`${node.nodeName.toLowerCase()}`]);
        jsonNode.push(childNode);
    }

}

export const to_json = (html: string): string => {
	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = html;
    let ret: any = [];
    nodeChildrenToJson(tempDiv, ret)
	return JSON.stringify(ret);
};
