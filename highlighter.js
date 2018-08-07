'use strict';

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

var queries = new Set([ "ation", "因为" ]);

function search(text, queries) {
  let spans = [];
  for (let i = 0; i < text.length; i++) {
    for (const query of queries) {
      let len = query.length;
      if (query === text.substring(i, i + len)) {
        spans.push([ query, i, i + len ]);
      }
    }
  }
  return spans;
}

let currentSpanNode = null;

function mouseEnterListener(event) {
  let x = event.clientX;
  let y = event.clientY;
  let element = document.elementFromPoint(x, y);
  currentSpanNode = element;
}

function mouseLeaveListener(event) {
  currentSpanNode = null;
}

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

function highlightMatches() {
  let iter = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT);
  while (iter.nextNode()) {
    let node = iter.referenceNode;
    if (TAG_LIST.includes(node.parentNode.tagName) &&
        !node.parentNode.classList.contains("highlighted")) {
      let text = node.textContent;

      let spans = search(text, queries);
      if (spans.length > 0) {
        replaceTextWithSpans(node, spans);
      }
    }
  }
  document.body.normalize();
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

function addPhrase(phrase) { queries.add(phrase); }
function removePhrase(phrase) { queries.delete(phrase); }

function toggleSelectedPhrase() {
  if (currentSpanNode === null) {
    let text = window.getSelection().toString();
    if (text.length > 0) {
      addPhrase(text);
      highlightMatches();
    }
  } else {
    let text = currentSpanNode.textContent;
    removePhrase(text);
    unhighlight(text);
    currentSpanNode = null;
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request === "toggle-selected-phrase") {
    toggleSelectedPhrase();
  }
});

highlightMatches();
