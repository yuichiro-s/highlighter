'use strict';

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

function addPhrase(phrase) { queries.add(phrase); }
function removePhrase(phrase) { queries.delete(phrase); }
