export function querySelector<T extends Element>(selector: string): T | null {
  return document.querySelector(selector) as T | null;
}

export function querySelectorAll<T extends Element>(selector: string): T[] {
  return Array.from(document.querySelectorAll(selector)) as T[];
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options?: {
    className?: string;
    textContent?: string;
    innerHTML?: string;
    attributes?: Record<string, string>;
  }
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  if (options?.className) {
    element.className = options.className;
  }

  if (options?.textContent) {
    element.textContent = options.textContent;
  }

  if (options?.innerHTML) {
    element.innerHTML = options.innerHTML;
  }

  if (options?.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  return element;
}

export function setClass(element: Element, className: string, add: boolean): void {
  if (add) {
    element.classList.add(...className.split(' '));
  } else {
    element.classList.remove(...className.split(' '));
  }
}

export function setText(element: Element, text: string): void {
  element.textContent = text;
}

export function setHTML(element: Element, html: string): void {
  element.innerHTML = html;
}

export function addEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  event: K,
  handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void
): void {
  element.addEventListener(event, handler);
}

export function removeEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  event: K,
  handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void
): void {
  element.removeEventListener(event, handler);
}

export function getFormData(form: HTMLFormElement): FormData {
  return new FormData(form);
}

export function getFormValues(form: HTMLFormElement): Record<string, string> {
  const formData = new FormData(form);
  const values: Record<string, string> = {};

  formData.forEach((value, key) => {
    values[key] = String(value);
  });

  return values;
}

export function getInputValue(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string {
  return input.value;
}

export function setInputValue(
  input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  value: string
): void {
  input.value = value;
}

export function show(element: Element): void {
  element.classList.remove('hidden');
}

export function hide(element: Element): void {
  element.classList.add('hidden');
}

export function toggle(element: Element): void {
  element.classList.toggle('hidden');
}

export function appendChild(parent: Element, child: Element): void {
  parent.appendChild(child);
}

export function appendChildren(parent: Element, children: Element[]): void {
  children.forEach(child => parent.appendChild(child));
}

export function removeChild(parent: Element, child: Element): void {
  parent.removeChild(child);
}

export function clearChildren(element: Element): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

export function isEmpty(element: Element): boolean {
  return !element.hasChildNodes();
}
