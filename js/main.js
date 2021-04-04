const LineNavigator = require("line-navigator");
const Tablesort = require("tablesort");
const $ = require("./htmlElement").HtmlElement;

window.Tablesort = Tablesort;
require("../node_modules/tablesort/src/sorts/tablesort.number");

// Copied from https://github.com/regexhq/word-regex/blob/master/index.js
const WordRegex = /[a-zA-Z0-9_'\u0392-\u03c9\u0400-\u04FF\u0027]+|[\u4E00-\u9FFF\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af\u0400-\u04FF]+|[\u00E4\u00C4\u00E5\u00C5\u00F6\u00D6]+|[\u0531-\u0556\u0561-\u0586\u0559\u055A\u055B]+|\w+/g;

const alerts = $.byId("alerts");
const status = $.byId("status");
const currentStatus = $.byId("current-status");
const textFiles = document.getElementById("file-to-analyze").files;
const analyzeTextButton = $.byId("analyze-text");
const results = $.byId("results");
const wordFrequencyTable = $.byId("word-frequency-table");
const wordFrequencyTableBody = $.byId("word-frequency-table-body");
const totalWordCountSpan = $.byId("total-word-count");

new Tablesort(wordFrequencyTable.element);

let wordFrequency = {};
let totalWordCount = 0;
let startingIndex = 0;

analyzeTextButton.onClick(() => {
  const textFile = textFiles[0];
  if (!textFile) {
    showAlert("Don't forget to upload the file :)");
    return;
  }

  // Reset
  (() => {
    // Prevent double-clicks
    analyzeTextButton.disable();
    alerts.hide();
    status.show();
    results.hide();
    // Remove all rows except first (thead)
    for (let i = wordFrequencyTable.prop("rows").length-1; i > 0; i--) {
      wordFrequencyTable.element.deleteRow(i);
    }

    wordFrequency = {};
    totalWordCount = 0;
    startingIndex = 0;
  })();

  const lineNavigator = new LineNavigator(textFile);
  lineNavigator.readSomeLines(startingIndex, function handler(err, index, lines, isEof, progress) {
    // Update status
    (() => {
      if (progress < 90) {
        currentStatus.setTextContent("Reading file");
      } else {
        currentStatus.setTextContent("Analyzing text");
      }
    })();

    analyzeText(lines);

    if (err) {
      throw err;
    }

    if (isEof) {
      totalWordCountSpan.setTextContent(formatNumber(totalWordCount));

      // See https://stackoverflow.com/a/1069840
      const sortedWordFrequency = Object.entries(wordFrequency)
        .sort(([,a], [,b]) => b-a)
        .reduce((map, [k, v]) => ({...map, [k]: v}), {});
      for (const [word, frequency] of Object.entries(sortedWordFrequency)) {
        const asPercent = (frequency/totalWordCount * 100).toFixed(2) + "%";
        const row = createTrFromContent(word, formatNumber(frequency), asPercent);
        wordFrequencyTableBody.appendChild(row);
      }

      // Reset UI
      (() => {
        results.show();
        analyzeTextButton.enable();
      })();

      currentStatus.setTextContent("Done!");
      return;
    }

    lineNavigator.readSomeLines(index + lines.length, handler);
  });
});

function createTrFromContent(...tdContent) {
  const row = $.create("tr");
  for (const content of tdContent) {
    let td = $.createTd().setInnerHtml(content);
    row.appendChild(td);
  }
  return row;
}

function analyzeText(lines) {
  for (const line of lines) {
    const cleanLine = line.replace(/’|‘/g, "'");
    const words = cleanLine.match(WordRegex);
    if (!words) {
      continue;
    }

    for (const word of words) {
      const cleanedWord = cleanWord(word);

      // Skip empty words and numbers
      if (!cleanedWord || !isNaN(cleanedWord)) {
        continue;
      }

      if (!wordFrequency[cleanedWord]) {
        wordFrequency[cleanedWord] = 0;
      }

      wordFrequency[cleanedWord]++;
      totalWordCount++;
    }
  }
}

// Add commas to the number as needed
function formatNumber(number) {
  return number.toLocaleString("en");
}

function cleanWord(word) {
  word = word.toLowerCase();
  word = removeLeadingAndTrailing(word, "_");
  return word;
}

function removeLeadingAndTrailing(word, char) {
  if (word[0] === char) {
    word = word.substring(1);
  }

  // See https://stackoverflow.com/a/952945
  if (word.slice(-1) === char) {
    word = word.slice(0, -1);
  }

  return word;
}

function showAlert(message) {
  alerts
    .setInnerHtml(message)
    .show();
}