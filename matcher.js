'use strict';

function search(text, phrases) {
  let spans = [];
  let start = 0;

  while (start < text.length) {
    let node = phrases;
    // TODO: word boundary check
    let lastMatch = 0;

    let cursor = start;

    while (cursor < text.length) {
      const p = text.codePointAt(cursor);
      if (!(p in node)) {
        break;
      }
      node = node[p];
      cursor++;
      if (node.end) {
        lastMatch = cursor;
      }
    }

    if (lastMatch > 0) {
      const phrase = text.substring(start, lastMatch);
      spans.push([phrase, start, lastMatch]);
      start = lastMatch;
    } else {
      start++;
    }
  }

  return spans;
}

function addPhrase(phrases, phrase) {
  let node = phrases;
  for (let i = 0; i < phrase.length; i++) {
    const p = phrase.codePointAt(i);
    if (!(p in node)) {
      node[p] = {};
    }
    node = node[p];
    node.end = node.end || (i === phrase.length-1);
  }
}

function isEmptyNode(node) {
  return Object.keys(node).length === 1;
}

function removePhrase(phrases, phrase) {
  const length = phrase.length;
  function dfs(node, i) {
    if (i >= length) {
      return isEmptyNode(node);
    } else {
      const p = phrase.codePointAt(i);
      if (dfs(node[p], i+1)) {
        delete node[p];
        return isEmptyNode(node) && !node.end;
      } else {
        return false;
      }
    }
  }
  dfs(phrases, 0);
}
