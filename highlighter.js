'use strict';

// tags to search for phrases
const TAG_LIST = [
  "P", "A", "B", "I", "STRONG", "EM", "H1", "H2", "H3", "H4", "H5", "H6", "LI",
  "TD", "SPAN", "DIV"
];

let currentSpanNode = null;

function mouseEnterListener(event) {
  let x = event.clientX;
  let y = event.clientY;
  let element = document.elementFromPoint(x, y);
  currentSpanNode = element;
}

function mouseLeaveListener(event) { currentSpanNode = null; }

function replaceTextWithSpans(textNode, spans) {
  let parentNode = textNode.parentNode;
  let text = textNode.textContent;

  function insert(newNode) { parentNode.insertBefore(newNode, textNode); }

  function insertText(begin, end) {
    let s = text.substring(begin, end);
    let newNode = document.createTextNode(s);
    insert(newNode);
  }

  let cursor = 0;
  for (const span of spans) {
    let phrase = span[0];
    let begin = span[1];
    let end = span[2];
    if (cursor < begin) {
      insertText(cursor, begin);
    }
    let spanNode = document.createElement("span");
    spanNode.addEventListener("mouseenter", mouseEnterListener);
    spanNode.addEventListener("mouseleave", mouseLeaveListener);
    spanNode.classList.add("highlighted");
    spanNode.setAttribute("data-phrase", phrase);
    spanNode.textContent = text.substring(begin, end);
    insert(spanNode);
    cursor = end;
  }
  if (cursor < text.length) {
    insertText(cursor, text.length);
  }

  parentNode.removeChild(textNode);
}

function highlight(phrases) {
  // unhighlight all first
  var elements = document.getElementsByClassName("highlighted");
  let i = elements.length;
  while (i--) {
    let element = elements[i];
    let parentNode = element.parentNode;
    let text = element.textContent;
    let newNode = document.createTextNode(text);
    parentNode.insertBefore(newNode, element);
    parentNode.removeChild(element);
  }

  let iter = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT);
  while (iter.nextNode()) {
    let node = iter.referenceNode;
    if (TAG_LIST.includes(node.parentNode.tagName)) {
      let text = node.textContent;

      let spans = search(text, phrases);
      if (spans.length > 0) {
        replaceTextWithSpans(node, spans);
      }
    }
  }
  document.body.normalize();
}

function isSelectingWord() {
  const selection = window.getSelection();
  if (selection.rangeCount == 0) {
    return false;
  }
  const range = selection.getRangeAt(0);
  if (range.startContainer !== range.endContainer ||
      range.startContainer.nodeType !== Node.TEXT_NODE) {
    return false;
  }
  const text = range.startContainer.textContent;

  const start = range.startOffset;
  if (isAlphaNumeric(text.codePointAt(start)) && start > 0 &&
      isAlphaNumeric(text.codePointAt(start - 1))) {
    // consecutive alphanumeric characters
    return false;
  }

  const end = range.endOffset;
  if (isAlphaNumeric(text.codePointAt(end - 1)) && end < text.length &&
      isAlphaNumeric(text.codePointAt(end))) {
    // consecutive alphanumeric characters
    return false;
  }

  return true;
}

function toggleSelectedPhrase() {
  if (currentSpanNode === null) {
    if (isSelectingWord()) {
      let text = window.getSelection().toString();
      load_phrases(function(phrases) {
        addPhrase(phrases, text);
        highlight(phrases);
        save_phrases(phrases);
      });
    }
  } else {
    let phrase = currentSpanNode.getAttribute("data-phrase");
    load_phrases(function(phrases) {
      removePhrase(phrases, phrase);
      currentSpanNode = null;
      highlight(phrases);
      save_phrases(phrases);
    });
  }
}

function save_phrases(phrases) { chrome.storage.sync.set({phrases}); }

function load_phrases(callback) {
  chrome.storage.sync.get([ 'phrases' ],
                          function(data) { callback(data.phrases); });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request === "toggle-selected-phrase") {
    toggleSelectedPhrase();
  }
});

load_phrases(highlight);
