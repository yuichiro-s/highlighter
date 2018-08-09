'use strict';

// tags to search for phrases
const TAG_LIST = [
  "P", "A", "B", "I", "STRONG", "EM", "H1", "H2", "H3", "H4", "H5", "H6", "LI",
  "TD", "SPAN", "DIV", "BLOCKQUOTE"
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
    let begin = span[0];
    let end = span[1];
    let phrase = span[2];
    let isPartial = span[3];
    if (cursor < begin) {
      insertText(cursor, begin);
    }
    let spanNode = document.createElement("span");
    spanNode.addEventListener("mouseenter", mouseEnterListener);
    spanNode.addEventListener("mouseleave", mouseLeaveListener);
    spanNode.classList.add("highlighted");
    if (isPartial) {
      spanNode.classList.add("partial-match");
    } else {
      spanNode.classList.add("full-match");
    }
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
  document.body.normalize();

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

function toggleSelectedPhrase() {
  if (currentSpanNode === null) {
    let text = window.getSelection().toString();
    loadPhrases(function(phrases) {
      addPhrase(phrases, text);
      highlight(phrases);
      savePhrases(phrases);
    });
  } else {
    let phrase = currentSpanNode.getAttribute("data-phrase");
    loadPhrases(function(phrases) {
      removePhrase(phrases, phrase);
      currentSpanNode = null;
      highlight(phrases);
      savePhrases(phrases);
    });
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request === "toggle-selected-phrase") {
    toggleSelectedPhrase();
  }
});

loadPhrases(highlight);
