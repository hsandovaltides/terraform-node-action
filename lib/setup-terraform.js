// Node.js core
const fs = require('fs').promises;
const os = require('os');
const path = require('path');

// External
const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const io = require('@actions/io');
const https = require('https');
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

async function getRelease(product, version, userAgent) {
  let release = '';
  const url = `https://releases.hashicorp.com/${product}/index.json`;
  core.info('url ' + url);

	/* https.get(url, (resp) => {
  let data = '';
  resp.on('data', (chunk) => {
    data += chunk;
  });


  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    core.info(JSON.parse(data).explanation);
  }); */
  const options = {
    hostname: 'releases.hashicorp.com',
    port: 443,
    path: `/${product}/index.json`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  };
  return await new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        resolve(JSON.parse(responseBody));
      });
    });

    req.on('error', (err) => {
      //reject(err);
    });

    //req.write(data)
    req.end();
  });
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
    url: `https://releases.hashicorp.com/terraform/${version}/terraform_${version}_${osPlatform}_${osArch}.zip`
  }

  core.info(`osArch ${build.url}.`);



  
  core.debug(`Finding releases for Terraform version ${version}`);
  const release = await getRelease('terraform', version, 'GitHub Action: Setup Terraform');
  
  core.info(`release ${release}`);
  
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