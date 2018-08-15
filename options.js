'use strict';

function exportPhrases() {
  loadPhrases(function(phrases) {
    let phraseList = listPhrases(phrases);
    let lines = [];
    for (let list of phraseList) {
      let line = list.join('\t');
      lines.push(line);
    }
    const str = lines.join('\n') + '\n';
    const data =
        'data:text/plain;charset=utf-8,' + encodeURIComponent(str);
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
      let entries = [];
      for (let line of e.target.result.split(/\n/)) {
        line = line.trim();
        if (line.length > 0) {
          let elements = line.split(/\t/);
          entries.push(elements);
        }
      }

      // load current phrases
      loadPhrases(function(phrases) {
        let count = 0;
        for (const entry of entries) {
          let phrase = entry[0];
          let time = entry[1];
          addPhrase(phrases, phrase, time);
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
