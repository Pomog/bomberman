
import { VElement } from "./VElement.js";
import render from "./render.js"

// compare the old vApp to the new vApp

// then replace the old vApp with the new vApp

//? then mount somehow only the items that have changed? so we can't use vApp.mount()

export const reactives = []

export function updateReactives() {
    reactives.forEach(reactive => {
        reactive = reactive
    })
}

/**
 * 
 * @param {{}} oldStyle 
 * @param {{}} newStyle 
 */
export function diffStyle(oldStyle, newStyle) {
    const patches = []

    // set new styles for elem
    for (const [k, v] of Object.entries(newStyle)) {
        patches.push($node => {
            $node.style[k] = v;
            return $node;
        })
    }

    // delete old styles
    for (const k of Object.keys(oldStyle)) {
        if (!(k in newStyle)) {
            patches.push($node => {
                $node.style[k] = null;
                return $node;
            })
        }
    }

    return $node => {
        for (const patch of patches) {
            patch($node)
        }
        return $node;
    }
}

/**
 * 
 * @param {{}} oldAttrs 
 * @param {{}} newAttrs 
 */
export function diffAttrs(oldAttrs, newAttrs) {
    const patches = []

    // set new attributes for elem
    if (typeof newAttrs === "object") {
        for (const [k, v] of Object.entries(newAttrs)) {
            patches.push($node => {
                $node.setAttribute(k, v)
                return $node;
            })
        }
    }
    // delete old attributes
    if (typeof oldAttrs === "object") {
        for (const [k, v] of Object.entries(oldAttrs)) {
            if (!(k in newAttrs)) {
                patches.push($node => {
                    $node.removeAttribute(k)
                    return $node;
                })
            }
        }
    }

    return $node => {
        for (const patch of patches) {
            patch($node)
        }
        return $node;
    }
}

/**
 * 
 * @param {Map.<VElement.vId, VElement>} oldVChildren 
 * @param {Map.<VElement.vId, VElement>} newVChildren 
 */
export function diffChildren(oldVChildren, newVChildren) {
    const childrenPatches = [];
    const additionalPatches = [];
    if (newVChildren == null) {
        oldVChildren?.forEach((oldVChild) => {
            childrenPatches.push(diff(oldVChild, undefined));
        })

    } else {
        oldVChildren?.forEach((oldVChild, i) => {
            childrenPatches.push(diff(oldVChild, newVChildren[i]));
        });
        for (const additionalVChild of newVChildren.slice(oldVChildren.length)) {
            additionalPatches.push($node => {
                $node.appendChild(additionalVChild.render().$elem);
                return $node;
            });
        }
    }

    return $parent => {
        $parent.childNodes.forEach(($child, i) => {
            childrenPatches[i]($child);
        });

        for (const patch of additionalPatches) {
            patch($parent);
        }

        return $parent;
    };

}
/**
 * 
 * @param {VElement} vOldNode 
 * @param {VElement} vNewNode 
 */
function diff(vOldNode, vNewNode) {
    // launch the callback for reactive values

    if (vNewNode === undefined) {
        return $n => {
            $n.remove();
            return undefined
        }
    }

    if (typeof vOldNode === "string" || typeof vNewNode === "string") {
        if (vOldNode !== vNewNode) {
            return $n => {
                const newNode = render(vNewNode)
                $n.replaceWith(newNode)
                return newNode
            }
        } else {
            // vOldNode and vNewNode are the same string
            return $n => $n
        }
    }

    if (vOldNode.state.tag !== vNewNode.state.tag) {
        return $n => {
            const $newNode = vNewNode.render().$elem;
            $n.replaceWith($newNode);
            return $n;
        }
    }

    const patchArrs = diffAttrs(vOldNode.state.attrs, vNewNode.state.attrs);
    const patchChildren = diffAttrs(vOldNode.state.children, vNewNode.state.children);

    return $n => {
        patchArrs($n);
        patchChildren($n);
        return $n;

    }
}


export function convertDOMtoVDOM(HTMLElement) {
    const vElem = new VElement({
        tag: HTMLElement.nodeName.toLowerCase(),
        attrs: getHTMLProps(HTMLElement.attributes),
        content: HTMLElement.children.length == 0 ? HTMLElement.textContent : "", // if an element has children HTML elements, we don't count it as innerHTML
        children: returnChildren(HTMLElement),
    });
    return vElem;
}
function getHTMLProps(attributes) {
    const props = {};
    for (let i = 0; i < attributes.length; i++) {
        props[attributes[i].name] = attributes[i].value;
    }
    return props;
}

function returnChildren(HTMLElement) {
    const vChildren = [];
    for (const child of HTMLElement.children) {
        const vChild = convertDOMtoVDOM(child);
        vChildren.push(vChild);
    }
    return vChildren;
}

export function convertStringTemplateToVDOM(template) {
    var wrapper = document.createElement("div");
    const finalDiv = document.createElement("div");
    wrapper.innerHTML = template;
    for (const child of wrapper.childNodes) {
        finalDiv.appendChild(child)
    }
    return convertDOMtoVDOM(finalDiv);
}