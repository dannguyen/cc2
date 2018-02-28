/* eslint
  no-console: "off",
  import/no-extraneous-dependencies: ["error", { "devDependencies": true }]
*/

const fs = require('fs');
const path = require('path');

const marked = require('marked');

const installFilename = path.join(__dirname, 'INSTALL.md');
const wrapperFilename = path.join(__dirname, '_install.html');
const outputFilename = path.join(__dirname, 'index.html');

const innerMarkdown = fs.readFileSync(installFilename, 'utf8');
const innerHtml = marked(innerMarkdown, { gfm: true });
const outer = fs.readFileSync(wrapperFilename, 'utf8');
fs.writeFileSync(outputFilename, outer.replace('###INSTRUCTIONS###', innerHtml));
console.log('Built docs.');
