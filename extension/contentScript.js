(function () {
  const converter = globalThis.SimpleChineseConverter;

  if (!converter || typeof converter.tify !== "function" || typeof converter.sify !== "function") {
    return;
  }

  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA"]);

  function convertText(text, direction) {
    if (!text) {
      return text;
    }

    return direction === "toTraditional" ? converter.tify(text) : converter.sify(text);
  }

  function isConvertibleInput(element) {
    if (!element || !(element instanceof Element)) {
      return false;
    }

    if (element instanceof HTMLTextAreaElement) {
      return true;
    }

    if (!(element instanceof HTMLInputElement)) {
      return false;
    }

    const convertibleTypes = new Set(["text", "search", "url", "tel", "email", "password"]);
    return convertibleTypes.has((element.type || "text").toLowerCase());
  }

  function convertTextControlValue(control, direction) {
    const value = control.value || "";
    const start = control.selectionStart;
    const end = control.selectionEnd;

    if (typeof start === "number" && typeof end === "number" && end > start) {
      const selected = value.slice(start, end);
      const converted = convertText(selected, direction);

      if (converted !== selected) {
        control.value = value.slice(0, start) + converted + value.slice(end);
        const newCaret = start + converted.length;
        control.selectionStart = start;
        control.selectionEnd = newCaret;
        return 1;
      }
      return 0;
    }

    const convertedAll = convertText(value, direction);
    if (convertedAll !== value) {
      control.value = convertedAll;
      return 1;
    }

    return 0;
  }

  function convertContentEditableSelection(editableRoot, direction) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return 0;
    }

    const range = selection.getRangeAt(0);
    if (!editableRoot.contains(range.commonAncestorContainer)) {
      return 0;
    }

    const selectedText = range.toString();
    if (!selectedText) {
      return 0;
    }

    const converted = convertText(selectedText, direction);
    if (converted === selectedText) {
      return 0;
    }

    range.deleteContents();
    range.insertNode(document.createTextNode(converted));
    return 1;
  }

  function convertContentEditableAll(editableRoot, direction) {
    const walker = document.createTreeWalker(editableRoot, NodeFilter.SHOW_TEXT);
    let changed = 0;
    let node = walker.nextNode();

    while (node) {
      const original = node.nodeValue || "";
      const converted = convertText(original, direction);
      if (converted !== original) {
        node.nodeValue = converted;
        changed += 1;
      }
      node = walker.nextNode();
    }

    return changed;
  }

  function convertActiveInput(direction) {
    const active = document.activeElement;

    if (isConvertibleInput(active)) {
      return convertTextControlValue(active, direction);
    }

    if (active instanceof HTMLElement && active.isContentEditable) {
      const selectionChanged = convertContentEditableSelection(active, direction);
      if (selectionChanged > 0) {
        return selectionChanged;
      }
      return convertContentEditableAll(active, direction);
    }

    return 0;
  }

  function convertWindowSelection(direction) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return 0;
    }

    let changed = 0;

    for (let i = selection.rangeCount - 1; i >= 0; i -= 1) {
      const range = selection.getRangeAt(i);
      const selectedText = range.toString();
      if (!selectedText) {
        continue;
      }

      const converted = convertText(selectedText, direction);
      if (converted === selectedText) {
        continue;
      }

      range.deleteContents();
      range.insertNode(document.createTextNode(converted));
      changed += 1;
    }

    return changed;
  }

  function shouldSkipNode(textNode) {
    const parent = textNode.parentElement;
    if (!parent) {
      return true;
    }

    if (SKIP_TAGS.has(parent.tagName)) {
      return true;
    }

    if (parent.closest("[data-simtran-ignore='true']")) {
      return true;
    }

    return false;
  }

  function convertPage(direction) {
    const root = document.body;
    if (!root) {
      return 0;
    }

    let changed = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();

    while (node) {
      if (!shouldSkipNode(node)) {
        const original = node.nodeValue || "";
        const converted = convertText(original, direction);
        if (converted !== original) {
          node.nodeValue = converted;
          changed += 1;
        }
      }

      node = walker.nextNode();
    }

    const controls = root.querySelectorAll("input, textarea");
    for (const control of controls) {
      if (isConvertibleInput(control)) {
        changed += convertTextControlValue(control, direction);
      }
    }

    return changed;
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message !== "object") {
      return;
    }

    const direction = message.direction === "toTraditional" ? "toTraditional" : "toSimplified";
    let changed = 0;

    if (message.action === "convert-selection") {
      changed = convertActiveInput(direction);
      if (changed === 0) {
        changed = convertWindowSelection(direction);
      }
    } else if (message.action === "convert-page") {
      changed = convertPage(direction);
    } else if (message.action === "convert-input") {
      changed = convertActiveInput(direction);
    }

    if (typeof sendResponse === "function") {
      sendResponse({ ok: true, changed });
    }
  });
})();
