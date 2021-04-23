// Node.js core
const fs = require('fs').promises;
const os = require('os');
const path = require('path');

// External
const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const io = require('@actions/io');
const releases = require('@hashicorp/js-releases');
import('./helpers');

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
  const version = core.getInput('terraform_version');
  const wrapper = core.getInput('terraform_wrapper') === 'true';
  const workspace = core.getInput('terraform_workspace');
  // Gather OS details
  const osPlatform = os.platform();
  const osArch = os.arch();

  
  core.debug(`Finding releases for Terraform version ${version}`);
  const release = await releases.getRelease('terraform', version, 'GitHub Action: Setup Terraform');
  const platform = mapOS(osPlatform);
  const arch = mapArch(osArch);
  const build = release.getBuild(platform, arch);
  if (!build) {
    throw new Error(`Terraform version ${version} not available for ${platform} and ${arch}`);
  }
  // Download requested version
  const pathToCLI = await downloadCLI(build.url);
  
  core.debug(`Terraform CLI path is ${pathToCLI}.`);

  
  // Install our wrapper
  /* if (wrapper) {
    await installWrapper(pathToCLI);
  } */

  core.addPath(pathToCLI);

  return release;
}

module.exports = run;