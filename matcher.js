'use strict';

function normalize(text) { return text.trim().toLowerCase(); }

function isAlphaNumeric(p) {
  if (0x30 <= p && p <= 0x39) {
    //  number
    return true;
  }
  return LETTERS.has(p);
}

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
      if (!(p in node)) {
        break;
      }
      node = node[p];
      cursor++;
      if (node.end) {
        isPartial = isPartial || (cursor < text.length &&
                                  isAlphaNumeric(text.codePointAt(cursor)));
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

function addPhrase(phrases, phrase) {
  phrase = normalize(phrase);
  if (phrase.length > 0) {
    let node = phrases;
    for (let i = 0; i < phrase.length; i++) {
      const p = phrase.codePointAt(i);
      if (!(p in node)) {
        node[p] = {};
      }
      node = node[p];
      node.end = node.end || (i === phrase.length - 1);
    }
    console.log("Added: " + phrase);
  }
}

function isEmptyNode(node) { return Object.keys(node).length === 1; }

function removePhrase(phrases, phrase) {
  phrase = normalize(phrase);

  const length = phrase.length;
  function dfs(node, i) {
    if (i >= length) {
      return isEmptyNode(node);
    } else {
      const p = phrase.codePointAt(i);
      if (dfs(node[p], i + 1)) {
        delete node[p];
        return isEmptyNode(node) && !node.end;
      } else {
        return false;
      }
    }
  }
  dfs(phrases, 0);
  console.log("Removed: " + phrase);
}
