
import { diffAttrs, diffStyle, diffChildren, updateReactives } from './functions.js';
import { throttleFunction } from './helpers.js';

/** virtualElements that represents DOM elements
 *@class VElements creates virtual Elements that represent DOM elements
 * 
 * @property {string} vId -  uuid of the element (read only), this vId is set as an argument vid for the corresponding real DOM Element
 * @property {object} state -  objece representing html state
 * @property {string} state.tag -  html tag
 * @property {object} state.attrs -  html attrs
 * @property {object} state.style -  html style
 * @property {string} state.content -  html content
 * @property {Map.<vElement.vId, vElement>} state.children -  Map of virtual Elements children
 * @property {object} events -  (read only) object's key is the event name (starting with '@'), value is callback function that will be called when the event is emitted
 * @method render - render the virtual element to the DOM Element
 * @method mount - mount the virtual element to the given DOM Element (replace the existing DOM Element with rendered virtual Element)
 * @method getChild - get child recursively by its vId
 * @method setAttr - add/replace(with the same names) virtual element's attributes 
 * @method delAttr  - remove attribute with given name
 * @method setStyle - add/replace(with the same names) virtual element's style attributes
 * @method delStyle  - remove style attributes with given name
 * @method addClass - add className to the class attribute of this vElement
 * @method delClass - remove className from the class attribute of this vElement
 * @method addChild - add new child to the virtual element
 * @method delChild - remove a child with given vId from the virtual element's children Map
 * @method on - add listener (callback) to an event
 * @method emit - fire an event 
*/
export class VElement {
    /**create an element with the tag, attributes,  possible children, and events at once.
     * 
     * If the argument is string it will create virtual Element representing pure string , 
     * to change this string use vElem.content="new string", any other changes will be ignored.
     * If the argument is an object, next properties will beare allowd (any others will be ignored):
     *   tag - the tag name
     *   attrs - the attributes
     *   children - array of VElements
     *   content - the text to be inserted into the DOM Element
     *   parameters with name starting with `@` and  a function as the value - those will be considered as events, their values as handlers, 
     *   for example '@click': (velm) => { velm.setAttr({ style: "color: green;" })}
     * Events 'name (if there is any) must start with `@` 
     *@constructor
     *
     * 
     * @param {object|string}  [vElemObj={ tag: "div", attrs: {}, content: "", children: [] }] - object representing the element, defaul is { tag: "div", attrs: {}, content: "", children: [] } 
     * @param {string} [vElem.tag='div']  - ex. 'div', 'span' etc, default value is 'div'
     * @param {{}=} vElem.attrs - ex. `{id: 'container'}` , attribute vID is reserved for internal use only (keep id of the corresponding vElement)
     * @param {{}|string=} vElem.style - ex. `{display: 'none'}` or "display: none" , style  attribute
     * @param {string= } vElem.content  - plain text or html
     * @param {VElement[]|undefined} vElem.children  can add children recursively by making new Elements in the children Map
     */
    constructor(vElemObj = { tag: "div", attrs: {}, style: {}, content: "", children: [] }) {
        this._vId = crypto.randomUUID();

        // for non string elements attributes and children are not null to prevent checking them in all methods and functions 
        if (typeof vElemObj === "object") {
            if (typeof vElemObj.attrs !== "object") {
                vElemObj.attrs = {};
            }
            switch (typeof vElemObj.style) {
                case "string":
                    vElemObj.style = styleObjectFromString(vElemObj.style);
                    break;
                case "object":
                    break;
                default:
                    vElemObj.style = {};
                    break;

            }

            if (!(vElemObj.children instanceof Array)) {
                vElemObj.children = [];
            }

            Object.assign(vElemObj.style, separateStyle(vElemObj.attrs));

            // vElemObj.attrs.style = vElemObj.style;

        }

        if (typeof vElemObj === "string") {
            vElemObj = { tag: undefined, attrs: undefined, content: vElemObj, children: undefined }
        }


        //const preparedChildren = prepareChildren(vElemObj.children)

        this.state = new Proxy(
            {
                tag: vElemObj.tag,
                attrs: vElemObj.attrs,
                style: vElemObj.style,
                content: vElemObj.content, // need this to keep string vElement, becaose can't create Proxy of string
                children: vElemObj.children,
            },
            {
                get: (stateObj, key) => {
                    throttleFunction(updateReactives(), 1000)

                    return stateObj[key]
                },
                /** allows to set properties tag, arggs, content, children. Any other will be ignored. value for children property is VElement[], which will be converted to Map
                 * 
                 */
                set: (stateObj, key, value) => {
                    if (value === undefined ||
                        value === null ||
                        key === undefined ||
                        key === null) {
                        return
                    }

                    if (key === 'tag') {
                        stateObj.tag = value;
                        if (this.$elem instanceof Element) {
                            const $oldElm = this.$elem //neeed to keep the old $elem because after render (in the next row) it will be renewed
                            this.render().mount($oldElm); // this is VElement, stateObj is this.state (keep forgotting)
                        }
                        return true
                    }

                    if (key === 'content') {
                        stateObj.content = value;
                        if (this.$elem instanceof Element) {
                            this.$elem.innerHTML = value;
                        } else if (this.$elem instanceof Text) {
                            stateObj.tag = ''; // just in case 
                            const $oldElm = this.$elem
                            this.render().mount($oldElm);
                        }
                        return true
                    }

                    // works if we assighn a new object as attrs
                    if (key === 'attrs') {
                        const oldAttrs = stateObj.attrs;
                        stateObj.attrs = value;
                        if (this.$elem instanceof Element) {
                            const patch = diffAttrs(oldAttrs, stateObj.attrs);
                            this.$elem = patch(this.$elem)
                        }
                        return true
                    }

                    if (key === 'style') {
                        console.log('in proxy set style');
                        const oldStyle = stateObj.style;
                        stateObj.style = value;
                        if (this.$elem instanceof Element) {
                            console.log('in proxy set style loop');

                            const patch = diffStyle(oldStyle, stateObj.style);
                            this.$elem = patch(this.$elem)
                        }
                        return true
                    }

                    // works if we assign a Map or undefined as children
                    if (key === 'children') {
                        if (value == null || (value instanceof Array && stateObj.tag)) {

                            const oldChildren = stateObj.children;
                            stateObj.children = value;
                            if (this.content && this.content !== '') {
                                oldChildren.unshift(this.content);
                                value.unshift(this.content);
                            }
                            if (this.$elem instanceof Element) {
                                const patch = diffChildren(oldChildren, value);
                                this.$elem = patch(this.$elem);
                            }
                            return true
                        }
                        return false;
                    }

                    stateObj[key] = value;
                    return true
                },
            }
        );

        this._events = new Proxy({},
            {
                set: (target, eventType, callback) => {
                    if (!eventType.startsWith("@") || !(typeof callback === 'function')) {
                        throw new Error("events set error: wrong event type: " + eventType)
                    }
                    if (!target[eventType]) {
                        target[eventType] = [];
                    }
                    target[eventType].push(callback);

                    return true;
                },
            });

        for (const prop in vElemObj) {
            if (prop.startsWith('@')) {
                try {
                    this._events[prop] = vElemObj[prop];
                } catch (e) {
                    console.error("cant add listener for event " + prop + ", err " + e)
                }
            }
        }
    }

    get vId() {
        return this._vId;
    }

    get tag() {
        return this.state.tag;
    }
    get attrs() {
        return { ...this.state.attrs, style: stringFromStyleObject(this.state.style) };
    }
    get style() {
        return this.state.style;
    }
    get content() {
        return this.state.content;
    }
    get children() {
        // if (this.state.children == null) return this.state.children;
        return this.state.children//.values(); // remember the children property is Map
    }
    get events() {
        return Object.entries(this._events)
    }

    set tag(value) {
        return this.state.tag = value;
    }
    set attrs(value) {
        const newStyle = separateStyle(value);
        if (newStyle) {
            this.state.style = newStyle
        }
        return this.state.attrs = value;
    }
    set style(value) {
        switch (typeof value) {
            case "string":
                value = styleObjectFromString(value);
                break;
            case "object":
                break;
            default:
                value = {};
                break;

        }
        return this.state.style = value;
    }
    set content(value) {
        return this.state.content = value;
    }
    set children(value) {
        // switch (true) {
        //     case value instanceof Array:
        //         const preparedChildren = prepareChildren(value)
        //         this.state.children = new Map(preparedChildren);
        //         break;
        //     case value instanceof Map:
        //         this.state.children = value;
        //         break;
        //     default:
        //         console.error("can't assign the children property other than Array or Map");
        //         break;
        // }

        return this.state.children = value;
    }
    /**
     * 
     * @param {VElement} newVElem 
     */
    replaceElement(newVElem) {
        this.$elem = newVElem
    }

    /** get child by its vId
     * 
     * @param {string} vId - VElement.vId
     * @returns 
     */
    getChild(vId) {
        // const children = this.state.children
        // let searchChild
        // if (children) {
        //     searchChild = children.get(vId);
        //     if (!searchChild) {
        //         for (const [key, child] of children) {
        //             searchChild = child.getChild(vId);
        //             if (searchChild) return searchChild
        //         }
        //     }
        // }
        // return searchChild;

        for (const child of this.state.children) {
            if (child.vId === vId) {
                return child;
            }
        }
        for (const child of this.state.children) {
            const searchChild = child.getChild(vId);
            if (searchChild) {
                return searchChild;
            }
        }
        return null;
    }

    /** render the virtual element to the DOM Element
     * 
     * @returns  
     */
    render() {
        //console.log(`start render: `, this);
        if (this.state.tag == null || this.state.tag == '') {
            const $elem = document.createTextNode(this.state.content);
            this.$elem = $elem;
            return this;
        }

        const $elem = document.createElement(this.state.tag);
        this.$elem = $elem;

        for (const [k, v] of Object.entries(this.state.attrs)) {
            $elem.setAttribute(k, v);
        }

        for (const [k, v] of Object.entries(this.state.style)) {
            $elem.style[k] = v;
        }

        if (this.state.content !== undefined && this.state.content !== '') {
            $elem.innerHTML = this.state.content;
        }

        if (this.state.children) {
            this.state.children.forEach((child) => {
                $elem.appendChild(child.render().$elem);
            });
        }

        this.$elem.setAttribute('vId', this.vId);
        return this;
    }

    /** mount - mount the virtual element to the given DOM Element (replace the existing DOM Element with rendered virtual Element)
     * 
     * @param {Element} $elem 
     * @returns 
     */

    mount($elem) {
        $elem.replaceWith(this.render().$elem);
        return this;
    }

    /** adds/replaces(with the same names) virtual element's attributes 
     * 
     * @param {object.<string, string>} attrs - attributes of the element
     * @returns 
     */
    setAttr(attrs = {}) {
        if (this.state.tag) {
            Object.assign(this.state.attrs, attrs)
            if (this.$elem instanceof Element) {
                for (const [k, v] of Object.entries(attrs)) {
                    this.$elem.setAttribute(k, v);
                }
            }
        }
        return this;
    }

    /** adds/replaces(with the same names) virtual element's style 
     * 
     * @param {object.<string, string>} styleObj - attributes of the element
     * @returns 
     */
    setStyle(styleObj = {}) {
        if (this.state.tag) {
            if (typeof styleObj === 'string') { styleObj = styleObjectFromString(styleObj); }
            Object.assign(this.state.style, styleObj)
            if (this.$elem instanceof Element) {
                for (const [k, v] of Object.entries(styleObj)) {
                    this.$elem.style[k] = v;
                }
            }
        }
        return this;
    }

    /** a   
     * 
     * @param {string} className 
     * @returns 
     */
    addClass(className) {
        if (this.state.attrs.class) {
            this.state.attrs.class += ` ${className}`;
        } else {
            this.state.attrs.class = className;
        }

        if (this.$elem instanceof Element) {
            this.$elem.classList.add(className);
        }
        return this;
    }

    /** adds a virtual element as a child  of this virtual element.
     * If this element is mounted, it will render the virtual child and mount as a child of real DOM element
     * 
     * @param {VElement|string} vNode - new virtual element
     * @returns 
    */
    addChild(vNode) {
        if (typeof vNode === 'string') {
            vNode = new VElement({ content: vNode })
        }

        // checks for null and undefined
        if (this.state.children == null) {
            this.state.children = [];
        }

        if (vNode instanceof VElement) {
            this.state.children.push(vNode);
            if (this.$elem instanceof Element) {
                const $node = vNode.render().$elem
                this.$elem.appendChild($node);
            }
        }

        return this
    }

    /** creates virtual Element as a child of this vElement.
     * 
     * @param {object} obj - object representing virtual Element, default is empty div element (like <div></div>)
     * @returns 
     */
    createElement(obj = { tag: "div", attrs: {}, content: "", children: [] }) {
        const vElem = new VElement(obj);
        this.addChild(vElem);

        return this;
    }

    /** removes a child with given vId or index in the children array 
     *  if parameter is a string, it will be considerd as a vId of a child. The chiled to remove wil be searched recursively;
     *  if parameter is number, it will be considered as an index in the children array
     * 
     * @param {string|number} id  - VElement.vId
     * @returns deleted child or null if there was no child with given vId or index
     */
    delChild(id) {
        const patch = (child) => {
            if (child.$elem instanceof Element) {
                child.$elem.remove();
            }
        }
        if (typeof id === 'string') {
            for (let i = 0; i < this.state.children.length; i++) {
                const child = this.state.children[i];
                if (child.vId === id) {
                    this.state.children.splice(i, 1);
                    patch(child);
                    return child;
                }
            }
            for (const child of this.state.children) {
                const deletedChild = child.delChild(id);
                if (deletedChild) {
                    return deletedChild;
                }
            }
            return null;
        } else if (typeof id === 'number') {
            const deleted = this.state.children.splice(id, 1);
            if (deleted.length === 1) {
                patch(deleted[0]);
            }
            return deleted[0];
        }
    }
    /** rereplaces a child with given vId or index in the children array 
     *  if parameter is a string, it will be considerd as a vId of a child. The chiled to replace wil be searched recursively;
     *  if parameter is number, it will be considered as an index in the children array
     * 
     * @param {string|number} id in the children array
     * @param {VElement} vElement vElement to replace with
     * @returns replaced child or null if there was no child with given vId or index
     */
    replaceChild(id, vElement) {
        const patch = (child) => {
            if (child.$elem instanceof Element) {
                child.$elem.replaceWith(vElement.render().$elem);
            }
        }
        if (typeof id === 'string') {
            for (let i = 0; i < this.state.children.length; i++) {
                const child = this.state.children[i];
                if (child.vId === id) {
                    this.state.children[i] = vElement;
                    patch(child);
                    return child;
                }
            }
            for (const child of this.state.children) {
                const replacedChiled = child.replaceChild(id, vElement);
                if (replacedChiled) {
                    return replacedChiled;
                }
            }
            return null;
        } else if (typeof id === 'number') {
            const oldChild = this.state.children[id];
            if (oldChild) {
                this.state.children[id] = vElement;
                patch(oldChild);
            }
            return oldChild;
        }
    }

    /** remove attribute with given name
     * 
     * @param {string} key - name of the attribute
     * @returns
     */
    delAttr(key) {
        delete this.state.attrs[key];
        if (this.$elem) {
            this.$elem.removeAttribute(key);
        }
        return this;
    }

    /** remove class with given name
     * 
     * @param {string} className - class' name to remove
     * @returns
     */
    delClass(className) {
        if (this.state.attrs.class) {
            const regexp = new RegExp(className, 'g');
            console.log("delClass: " + className, regexp, 'attrs.class: ' + this.state.attrs.class);
            this.state.attrs.class = this.state.attrs.class.replace(regexp, "");
        }
        if (this.$elem instanceof Element) {
            this.$elem.classList.remove(className);
        }

        return this;
    }
    /** remove attribute with given name
     * 
     * @param {string} key - name of the attribute
     * @returns
     */
    delStyle(key) {
        delete this.state.style[key];
        if (this.$elem) {
            this.$elem.style[key] = null;
        }
        return this;
    }

    /** adds listener (callback) to an event
     * 
     * @param {string} eventType 
     * @param {function} callback 
     * @returns 
     */
    on(eventType, callback) {
        // _events' setter do all checking and setting 
        try {
            this._events[eventType] = callback;
        } catch (e) {
            console.error("cant add listener for event " + eventType + ", err " + e)
        }
        return this;
    }

    /** fire an event 
     * 
     * @param {string} eventType 
     * @returns 
     */
    emit(eventType, $event) {
        this._events[eventType]?.forEach((callback) => {
            if (eventType.endsWith(".prevent")) { $event.preventDefault(); }
            callback(this, $event)
        });

        return this;
    }
}

/** helper - creates the array from which Map of children will be created 
 * 
 * @param {VElement[]=} children - list of virtual elements
 * @returns {Array.<string,VElement>| undefined} 
 */
function prepareChildren(children) {
    let preparedChildren = undefined;
    if (isIterable(children)) {
        preparedChildren = [];
        for (const child of children) {
            if (child instanceof VElement) {
                preparedChildren.push([child.vId, child]);
            } else {
                const newElm = new VElement(child);
                preparedChildren.push([newElm.vId, newElm]);
            }
        }
    }
    return preparedChildren;
}

/** helper - returns true if the obj is iterable
 * 
 * @param {*} obj 
 * @returns 
 */
function isIterable(obj) {
    // checks for null and undefined
    if (obj == null) {
        return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
}

function styleObjectFromString(str) {
    const styleObj = {};
    str = str.replace(/[\s\r\n]+/g, " ");

    const styles = str.split(';');
    for (const style of styles) {
        const [prop, value] = style.split(':');
        if (prop && value) {
            styleObj[prop.trim()] = value.trim();
        }
    }
    return styleObj;
}

function stringFromStyleObject(styleObj = {}) {
    return Object.entries(styleObj).reduce((str, style) => {
        return str.concat(style.join(': '), '; ');
    }, "")
}

function separateStyle(attrs) {
    let style;
    for (const [key, val] of Object.entries(attrs)) {
        if (key === 'style') {
            style = styleObjectFromString(val);
            delete attrs.style;
        }
    }
    return style;
}