/* eslint
  no-console: "off",
  import/no-extraneous-dependencies: ["error", { "devDependencies": true }]
*/

const fs = require('fs');
const path = require('path');

const glob = require('glob');
const marked = require('marked');
const rollup = require('rollup');
const buble = require('rollup-plugin-buble');

const installFilename = path.join(__dirname, 'INSTALL.md');
const wrapperFilename = path.join(__dirname, '_install.html');
const outputFilename = path.join(__dirname, 'index.html');

const deployListFilename = path.join(__dirname, 'deploy-files.json');

const jsFilename = path.join(__dirname, '_index.js');
const bubledFilename = path.join(__dirname, 'index.js');

const buildInstructions = function buildInstructionsFunc() {
  const innerMarkdown = fs.readFileSync(installFilename, 'utf8');
  const innerHtml = marked(innerMarkdown, { gfm: true });
  const outer = fs.readFileSync(wrapperFilename, 'utf8');
  fs.writeFileSync(outputFilename, outer.replace('###INSTRUCTIONS###', innerHtml));
  console.log('Built instructions.');
};

const buildDeployList = function buildDeployListFunc() {
  const filenames = glob.sync('@(client|server|public)/**/!(bundle)*', { nodir: true });
  filenames.push('package.json', 'package-lock.json', 'rollup.config.js', 'LICENSE.txt');
  fs.writeFileSync(deployListFilename, JSON.stringify(filenames));
  console.log('Built deploy list.');
};

const bubleJs = async function bubleJsFunc() {
  const bundle = await rollup.rollup({
    input: jsFilename,
    plugins: [buble()],
  });
  await bundle.write({
    format: 'iife',
    file: bubledFilename,
  });
  console.log('Bubled js.');
};

buildInstructions();
buildDeployList();
bubleJs();
