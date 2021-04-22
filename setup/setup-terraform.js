// Node.js core
const fs = require('fs').promises;
const os = require('os');
const path = require('path');

// External
const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const io = require('@actions/io');
const releases = require('@hashicorp/js-releases');


async function downloadCLI (url) {
    core.debug(`Downloading Terraform CLI from ${url}`);
    const pathToCLIZip = await tc.downloadTool(url);
  
    core.debug('Extracting Terraform CLI zip file');
    const pathToCLI = await tc.extractZip(pathToCLIZip);
    core.debug(`Terraform CLI path is ${pathToCLI}.`);
  
    if (!pathToCLIZip || !pathToCLI) {
      throw new Error(`Unable to download Terraform from ${url}`);
    }
  
    return pathToCLI;
}

async function run () {
    
}