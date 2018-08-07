'use strict';

function load_phrases(callback) {

}

function search(text, phrases) {
  let spans = [];
  for (let i = 0; i < text.length; i++) {
    for (const phrase of phrases) {
      let len = phrase.length;
      if (phrase === text.substring(i, i + len)) {
        spans.push([ phrase, i, i + len ]);
      }
    }
  }
  return spans;
}

function addPhrase(phrases, phrase) { phrases.push(phrase); }
function removePhrase(phrases, phrase) {
  let index = phrases.indexOf(phrase);
  if (index > -1) {
    phrases.splice(index, 1);
  }
}
