'use strict';

const MAX_PHRASE_LENGTH = 50;

function normalize(text) { return text.trim().toLowerCase(); }

function isAlphaNumeric(p) { return LETTERS.has(p); }

function isInsideWord(text, pos) {
  if (pos == 0) {
    return false;
  }

  // check consecutive alphanumeric characters
  return isAlphaNumeric(text.codePointAt(pos)) &&
         isAlphaNumeric(text.codePointAt(pos - 1));
}

function search(text, phrases) {
  let spans = [];
  let start = 0;
  text = text.toLowerCase();

  while (start < text.length) {
    let node = phrases;

    let cursor = start;
    let lastMatch = 0;
    let isPartial = isInsideWord(text, start);
    while (cursor < text.length) {
      const p = text.codePointAt(cursor);
      if (!(p in node.next)) {
        break;
      }
      node = node.next[p];
      cursor++;
      if (node.end) {
        isPartial =
            isPartial || (cursor < text.length && isInsideWord(text, cursor));
        lastMatch = cursor;
      }
    }

    if (lastMatch > 0) {
      const phrase = text.substring(start, lastMatch); // this is normalized
      spans.push([ start, lastMatch, phrase, isPartial ]);
      start = lastMatch;
    } else {
      start++;
    }
  }

  return spans;
}

function addPhrase(phrases, phrase, time) {
  phrase = normalize(phrase);
  if (0 < phrase.length && phrase.length <= MAX_PHRASE_LENGTH) {
    let node = phrases;
    for (let i = 0; i < phrase.length; i++) {
      const p = phrase.codePointAt(i);
      if (!(p in node.next)) {
        node.next[p] = {
          next: {},
          end: false,
          time: null,
        };
      }
      node = node.next[p];
      if (i === phrase.length - 1) {
        node.end = true;
        node.time = time || Date.now();
      }
    }
    console.log("Added: " + phrase);
  }
}

function isEmptyNode(node) {
  return Object.keys(node.next).length === 0;
}

function removePhrase(phrases, phrase) {
  phrase = normalize(phrase);

  const length = phrase.length;
  function dfs(node, i) {
    if (i >= length) {
      node.end = false;
      node.time = null;
      return isEmptyNode(node);
    } else {
      const p = phrase.codePointAt(i);
      if (dfs(node.next[p], i + 1)) {
        delete node.next[p];
        return isEmptyNode(node) && !node.end;
      } else {
        return false;
      }
    }
  }
  dfs(phrases, 0);
  console.log("Removed: " + phrase);
}

function listPhrases(phrases) {
  let phraseList = [];
  function dfs(node, prefix) {
    if (node.end) {
      phraseList.push([prefix, node.time]);
    }
    for (const p in node.next) {
      const c = String.fromCodePoint(p);
      dfs(node.next[p], prefix + [ c ]);
    }
  }
  dfs(phrases, []);
  return phraseList;
}

function savePhrases(phrases) { chrome.storage.local.set({phrases}); }

function loadPhrases(callback) {
  chrome.storage.local.get([ 'phrases' ],
                           function(data) { callback(data.phrases); });
}

function initPhrases() { chrome.storage.local.set({phrases : {
  next: {},
  end: false,
  time: null,
}}); }
