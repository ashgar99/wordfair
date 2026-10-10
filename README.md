<p align="center"><img src="docs/logo.svg" width="72" height="72" alt=""></p>
<h3 align="center">Wordfair</h3>
<p align="center">Count your essay the way markers do, leaving out references, footnotes, citations and quotations.</p>

<p align="center">
  <a href="LICENSE"><img alt="MIT licence" src="https://img.shields.io/github/license/ashgar99/wordfair?color=brightgreen" /></a>
  <img alt="Runs in your browser" src="https://img.shields.io/badge/runs-in%20your%20browser-blue" />
  <img alt="No sign-up" src="https://img.shields.io/badge/sign--up-not%20required-blue" />
</p>

<p align="center"><a href="https://ashgar99.github.io/wordfair/"><b>Open Wordfair</b></a></p>


## Features ✨

- Paste your text, or drop in a Word document (`.docx`).
- Leaves out the reference list or bibliography, everything after a heading such as References, Bibliography or Works Cited.
- Leaves out footnotes and endnotes, and optionally headings, read straight from your Word document's structure.
- Optionally leaves out in-text citations, such as (Smith, 2020, p. 4) or [3], and direct quotations.
- Checks your count against your word limit and the common 10% margin either side.
- Shows a breakdown of exactly what was left out.
- Counts Chinese, Japanese and Korean characters individually, as Microsoft Word does.
- Runs entirely in your browser. Files are never uploaded.


## Usage 🛠

1. Open [Wordfair](https://ashgar99.github.io/wordfair/).
2. Drop in your Word document, or paste your text.
3. Switch on the rules your department uses, and enter your word limit.


## What gets counted 🧮

Words are counted like Microsoft Word: anything separated by spaces that contains a letter or number. Hyphenated words count as one.

| Rule | What is left out |
| --- | --- |
| Reference list | Everything from the last heading called References, Reference List, Bibliography, Works Cited or Sources. |
| Footnotes and endnotes | All notes in a Word document. Pasted text does not usually include notes. |
| Headings | Paragraphs using Word's Title, Subtitle or Heading styles. |
| In-text citations | Brackets containing a year, and numbered references in square brackets. |
| Quotations | Text inside double quotation marks, and longer passages inside single ones. |

Departments differ, so always check your own guidance.


## Browser support 🌐

Works in current versions of Chrome, Edge, Brave, Firefox and Safari, on computers, tablets and phones.

## Troubleshooting 🔧

| Problem | Solution |
| --- | --- |
| The reference list is still counted | Make sure its heading is on its own line, such as "References" or "Bibliography". |
| Headings are not removed | Use Word's built-in Heading styles rather than bold text. |
| A `.doc` file will not open | Save it as `.docx` from Word first. |


## Privacy and security 🔒

Wordfair is a single page with no server. Word documents are opened inside your browser using the open-source [JSZip](https://stuk.github.io/jszip/) library and are never uploaded. Only your word limit and rule choices are remembered on your device.


## Development 🧩

The whole app lives in [`docs/`](docs): `index.html` for the page and `wordfair.js` for the logic. There is no build step.


## Unikit 🎒

Wordfair is part of Unikit, a set of free tools for students: [Modzip](https://ashgar99.github.io/moodle-module-downloader/), [Subzip](https://ashgar99.github.io/subzip/), [Duecal](https://ashgar99.github.io/duecal/), [Termcal](https://ashgar99.github.io/termcal/), [Gradewise](https://ashgar99.github.io/gradewise/) and [Readable](https://ashgar99.github.io/readable/).

Wordfair is not affiliated with or endorsed by Moodle or any university.


## Licence 📑

[MIT](LICENSE)
