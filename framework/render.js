import { VElement } from "./VElement.js";
 /**render virtual Node or string to the DOM 
     *
     *
     * 
     * @param {VElement | string} vNode virtual Node or text
 */
export default function render(vNode) {
    if (typeof vNode === 'string') {
        return document.createTextNode(vNode);
    }

    if (vNode instanceof VElement) {
        
        return vNode.render();
    }

    return undefined;
}
