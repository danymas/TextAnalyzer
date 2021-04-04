class HtmlElement {
  constructor(element) {
    this.element = element;
    this.tagName = element.tagName;
  }

  static create(elementType) {
    const element = document.createElement(elementType);
    return new HtmlElement(element);
  }

  static fromElement(element) {
    return new HtmlElement(element);
  }

  static byId(elementId) {
    const element = document.getElementById(elementId);
    return new HtmlElement(element);
  }

  static createTd() {
    const element = document.createElement("td");
    return new HtmlElement(element);
  }

  tagName() {
    return this.element.tagName;
  }

  onClick(fn) {
    this.element.addEventListener("click", fn);
    return this;
  }

  onChange(fn) {
    this.element.addEventListener("change", fn);
    return this;
  }

  onKeyup(fn) {
    this.element.addEventListener("keyup", fn);
    return this;
  }
  
  appendChild(htmlElement) {
    this.element.appendChild(htmlElement.element);
    return this;
  }

  appendNode(node) {
    this.element.appendChild(node);
    return this;
  }

  prop(prop) {
    return this.element[prop];
  }

  setId(id) {
    return this.setAttribute("id", id);
  }

  setAttribute(attribute, value) {
    this.element.setAttribute(attribute, value);
    return this;
  }

  hasClass(cssClass) {
    return this.element.classList.contains(cssClass);
  }

  addClasses(cssClasses) {
    cssClasses.map(cssClass => this.element.classList.add(cssClass));
    return this;
  }

  addClass(cssClass) {
    return this.addClasses([cssClass]);
  }

  removeClasses(cssClasses) {
    cssClasses.map(cssClass => this.element.classList.remove(cssClass));
    return this;
  }

  removeClass(cssClass) {
    return this.removeClasses([cssClass]);
  }

  show() {
    this.element.classList.remove("d-none");
    return this;
  }

  hide() {
    this.element.classList.add("d-none");
    return this;
  }

  toggle() {
    this.element.classList.toggle("d-none");
    return this;
  }

  isChecked() {
    return this.element.checked;
  }

  value() {
    return this.element.value;
  }

  innerHtml() {
    return this.element.innerHTML;
  }

  textContent() {
    return this.element.textContent;
  }

  querySelector(selector) {
    return this.element.querySelector(selector);
  }

  querySelectorAll(selector) {
    return this.element.querySelectorAll(selector);
  }

  setTextContent(textContent, concat = false) {
    if (concat) {
      this.element.textContent += textContent;
    } else {
      this.element.textContent = textContent;
    }
    return this;
  }

  setInnerHtml(innerHtml, concat = false) {
    if (concat) {
      this.element.innerHTML += innerHtml;
    } else {
      this.element.innerHTML = innerHtml;
    }
    return this;
  }

  setValue(value, concat = false) {
    if (concat) {
      this.element.value += value;
    } else {
      this.element.value = value;
    }
    return this;
  }

  setWidth(width) {
    return this.setStyle("width", width);
  }

  addStyle(style, value) {
    this.element.style[style] = value;
    return this;
  }

  enable() {
    this.element.disabled = false;
    return this;
  }

  disable() {
    this.element.disabled = true;
    return this;
  }
}

module.exports = { HtmlElement };