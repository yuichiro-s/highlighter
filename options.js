'use strict';

function exportPhrases() {
  loadPhrases(function(phrases) {
    let phraseList = listPhrases(phrases);
    const phrasesStr = phraseList.join('\n') + '\n';
    const data =
        'data:text/plain;charset=utf-8,' + encodeURIComponent(phrasesStr);
    let downloadLink = document.getElementById("downloadLink");
    downloadLink.setAttribute("href", data);
    downloadLink.click();
  });
}

function importPhrases() {
  let fileElem = document.getElementById("fileElem");
  fileElem.click();
}

function handleFiles(evt) {
  let files = evt.target.files;

  if (files.length !== 0) {
    let file = files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
      // load new phrases
      let newPhrases = [];
      for (let line of e.target.result.split(/\n/)) {
        line = line.trim();
        if (line.length > 0) {
          newPhrases.push(line);
        }
      }

      // load current phrases
      loadPhrases(function(phrases) {
        let count = 0;
        for (const phrase of newPhrases) {
          addPhrase(phrases, phrase);
          count++;
        }
        alert(count + " words loaded.");
        savePhrases(phrases);
      });
    };
    reader.readAsText(file);
  }
}

function clearPhrases() {
  if (confirm(
          "Are you sure you want to clear the word list? This cannot be undone.")) {
    initPhrases();
  }
}

document.getElementById("fileElem").addEventListener("change", handleFiles);
document.getElementById("exportButton")
    .addEventListener("click", exportPhrases);
document.getElementById("importButton")
    .addEventListener("click", importPhrases);
document.getElementById("clearButton").addEventListener("click", clearPhrases);
