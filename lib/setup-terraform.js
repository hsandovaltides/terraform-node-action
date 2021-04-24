// Node.js core
const fs = require('fs').promises;
const os = require('os');
const path = require('path');

// External
const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const io = require('@actions/io');
//const releases = require('@hashicorp/js-releases');
//import('./helpers');

function mapArch (arch) {
  const mappings = {
    x32: '386',
    x64: 'amd64'
  };
  return mappings[arch] || arch;
}

// os in [darwin, linux, win32...] (https://nodejs.org/api/os.html#os_os_platform)
// return value in [darwin, linux, windows]
function mapOS (os) {
  const mappings = {
    win32: 'windows'
  };
  return mappings[os] || os;
}

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

  core.info(`version ${version}.`);
  core.info(`workspace ${workspace}.`);
  core.info(`osPlatform ${osPlatform}.`);
  core.info(`osArch ${osArch}.`);
  
  const build = {
    url: 'https://releases.hashicorp.com/terraform/${version}/terraform_version_${osPlatform}_${osArch}.zip'
  }

  core.info(`osArch ${build.url}.`);



  
  core.debug(`Finding releases for Terraform version ${version}`);
  //const release = await releases.getRelease('terraform', version, 'GitHub Action: Setup Terraform');
  const platform = mapOS(osPlatform);
  const arch = mapArch(osArch);
  //const build = release.getBuild(platform, arch);
  
  if (!build) {
    throw new Error(`Terraform version ${version} not available for ${platform} and ${arch}`);
  }
  // Download requested version
  const pathToCLI = await downloadCLI(build.url);
  core.debug(`Terraform CLI path is ${pathToCLI}.`);

  core.info(`pathToCLI ${pathToCLI}.`);
  // Install our wrapper
  /* if (wrapper) {
    await installWrapper(pathToCLI);
  } */

  core.addPath(pathToCLI);

  return release;
}

module.exports = run;