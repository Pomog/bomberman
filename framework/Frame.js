import { VElement } from "./VElement.js";

/**
 * Creates a virtual Application instance.
 * 
 * @class
 * @param {VElement} [vElem] - Optional. If provided, it is used as the root 
 *                             element of the Frame. If not provided, defaults 
 *                             to creating a new VElement with a div tag and an 
 *                             ID of "app", serving as the root element.
 * 
 * @method useEvents - Declare list of DOM events you want to use.
 * @method createElement - Create a new virtual element and add it to the Frame as a child.
 * @method addVElement - Add the given virtual element to the Frame as a child.
 * @method render - Render the Frame (corresponding virtual Element) to the DOM Element.
 * @method mount - Mount the Frame (corresponding virtual Element) to the given DOM Element 
 *                 (replace the existing DOM Element with rendered virtual Element).
 * @method getState - Return (corresponding virtual Element) as object. TODO: Assess if needed.
 *
 * @protected 
 * @property _state - The virtual Element representing the Frame.
 * @property DOMEvents - Declared list of DOM events you want to use, read only.
 * @property children - List of this VElement's children.
 */

export class Frame {
  constructor(vElem = null) {
    console.log("new Frame")
      this._state = vElem || new VElement({
          tag: "div", attrs: { id: "app" }, content: "", children: []
      });
      this._DOMevents = [];
  }

  /**
   * @property children - list of this VElement's children
   */
  get children() {
    return this._state.children;
  }
  set children(value) {
    return (this._state.children = value);
  }

  /**
   * @property DOMEvents - declared list of DOM events you want to use, read only
   */
  get DOMevents() {
    return this._DOMevents;
  }

  use(dependency, dependencyName) {
    // pointless?
    this.dependencies[dependencyName] = dependency;
  }

  /** declares list of events fired on the DOM elements that the frame will be able to handle
   * @param {string} events - list of events
   * @returns
   */
  useEvents(...events) {
    this._DOMevents = events;
    this._DOMeventsListener = ($elem) => {
      // this func is called in the mount method
      this._DOMevents.forEach((DOMevent) => {
        $elem.addEventListener(DOMevent, ($event) => {
          // native listener will stop propagation and default behavior, and emit the corresponding event for the corresponding virtual Element
          $event.stopPropagation();
          const vElemUuid = $event.target.getAttribute("vID");
          let vTarget
          if (this._state.vId === vElemUuid) {
            vTarget = this._state;
          } else {
            vTarget = this._state.getChild(vElemUuid)
          }
          vTarget?.emit(`@${DOMevent}`, $event); // suppose all event in virtual elements have names started with @
          vTarget?.emit(`@${DOMevent}.prevent`, $event); // suppose all event in virtual elements have names started with @
        });
      });
    };

    return this;
  }

  /** creates virtual Element as a child of the frame.
   *
   * @param {object} obj - object representing virtual Element, default is empty div element (like <div></div>).
   * @returns
   */
  createElement(obj = { tag: "div", attrs: {}, content: "", children: [] }) {
    this._state.createElement(obj);

    return this;
  }

  /** addes given virtual Element as a child to the frame.
   *
   * @param {VElement} vElem - virtual Element
   * @returns
   */
  addVElement(vElem) {
    this._state.addChild(vElem);

    return this;
  }

  /**renders the initial virtual DOM into an actual DOM Element
   *
   * @returns {Element}
   */
  render() {
    this._state.render().$elem;
    return this; 
  }

  /**return (corresponding virtual Element) as object - TODO ? useless?
   *
   * @returns
   */
  getState() {
    return { ...this._state };
  }
  /** mount the Frame (corresponding virtual Element) to the given DOM Element (replace the existing DOM Element with rendered virtual Element)
   *
   * @param {Element} $elem the id of the element in the document to mount the DOM into (usually 'app')
   * @returns
   */
  mount($elem) {
    $elem = this._state.mount($elem).$elem;
    console.log(`frame is mounted to element`, $elem);
    this._DOMeventsListener($elem);
    return $elem;
  }
//TODO useless? 
  getVElementByID(id, scope) {
    if (!scope) {
      scope = this;
    }
    if (scope._state.attrs["id"]) {
      if (scope.attrs["id"] === id) {
        return scope;
      }
    } 
    console.log(scope.children.get(id))
    // if it doesn't find it in that scope, search children

    for (const [key, child] in scope.children) {
      this.getVElementByID(id, child);
    }
  }
  /**
   * 
   * @param {HTMLElement} HTMLElement 
   */
  
}
/**
 * 
 * @param {HTMLElement.attributes} attributes 
 */

