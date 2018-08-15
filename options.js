'use strict';

function exportPhrasesCommand() {
  loadPhrases(function(phrases) {
    let phraseList = listPhrases(phrases);
    let lines = [];
    for (let list of phraseList) {
      let line = list.join('\t');
      lines.push(line);
    }
    const str = lines.join('\n') + '\n';
    const data = 'data:text/plain;charset=utf-8,' + encodeURIComponent(str);
    let downloadLink = document.getElementById("downloadLink");
    downloadLink.setAttribute("href", data);
    downloadLink.click();
  });
}

function importPhrasesCommand() {
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

function clearPhrasesCommand() {
  if (confirm(
          "Are you sure you want to clear the word list? This cannot be undone.")) {
    initPhrases();
  }
}

function listPhrasesCommand() {
  loadPhrases(function(phrases) {
    let phraseList = listPhrases(phrases);
    let yesterday = Date.now() - 1000 * 60 * 60 * 24;
    let node = document.getElementById("wordList");
    node.innerHTML = "";
    for (let list of phraseList) {
      let phrase = list[0];
      let time = list[1];
      if (yesterday <= time) {
        let li = document.createElement("li");
        li.appendChild(document.createTextNode(phrase));
        node.appendChild(li);
      }
    }
  });
}

document.getElementById("fileElem").addEventListener("change", handleFiles);
document.getElementById("exportButton")
    .addEventListener("click", exportPhrasesCommand);
document.getElementById("importButton")
    .addEventListener("click", importPhrasesCommand);
document.getElementById("clearButton")
    .addEventListener("click", clearPhrasesCommand);
document.getElementById("listButton")
    .addEventListener("click", listPhrasesCommand);
