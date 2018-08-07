'use strict';

// tags to search for phrases
const TAG_LIST = [
  "P",
  "A",
  "B",
  "I",
  "STRONG",
  "EM",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "LI",
  "TD",
  "SPAN",
  "DIV",
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
    let begin = span[1];
    let end = span[2];
    if (cursor < begin) {
      insertText(cursor, begin);
    }
    let spanNode = document.createElement("span");
    spanNode.addEventListener("mouseenter", mouseEnterListener);
    spanNode.addEventListener("mouseleave", mouseLeaveListener);
    spanNode.classList.add("highlighted");
    spanNode.textContent = text.substring(begin, end);
    insert(spanNode);
    cursor = end;
  }
  if (cursor < text.length) {
    insertText(cursor, text.length);
  }

  console.log(parentNode.tagName);
  console.log(text);
  console.log(spans);

  parentNode.removeChild(textNode);
}

function highlight(phrases) {
  let iter = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT);
  while (iter.nextNode()) {
    let node = iter.referenceNode;
    if (TAG_LIST.includes(node.parentNode.tagName) &&
        !node.parentNode.classList.contains("highlighted")) {
      let text = node.textContent;

      let spans = search(text, phrases);
      if (spans.length > 0) {
        replaceTextWithSpans(node, spans);
      }
      document.body.normalize();
    }
  }
}

function unhighlight(phrase) {
  var elements = document.getElementsByClassName("highlighted");
  let i = elements.length;
  while (i--) {
    let element = elements[i];
    if (element.textContent === phrase) {
      let parentNode = element.parentNode;
      let newNode = document.createTextNode(phrase);
      parentNode.insertBefore(newNode, element);
      parentNode.removeChild(element);
    }
  }
  document.body.normalize();
}

function toggleSelectedPhrase() {
  if (currentSpanNode === null) {
    let text = window.getSelection().toString();
    if (text.length > 0) {
      load_phrases(function(phrases) {
        addPhrase(phrases, text);
        highlight(phrases);
        save_phrases(phrases);
      });
    }
  } else {
    let text = currentSpanNode.textContent;
    load_phrases(function(phrases) {
      removePhrase(phrases, text);
      currentSpanNode = null;
      unhighlight(text);
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
