// Node.js core
const fs = require('fs').promises;
const os = require('os');
const path = require('path');
const semver = require('semver');
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
  return await new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
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

function matchVersion(versions, range, includePrerelease) {
	// If a prerelease version range is given, it will only match in that series (0.14-rc0, 0.14-rc1)
	// unless includePrerelease is set to true
	// https://www.npmjs.com/package/semver#prerelease-tags
	const version = semver.maxSatisfying(Object.keys(versions), range, { includePrerelease });
	if (version) {
		return versions[version];
	} else {
		throw new Error("No matching version found");
	}
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



  const includePrerelease  = false;
  core.debug(`Finding releases for Terraform version ${version}`);
  const responseReleases = await getRelease('terraform', version, 'GitHub Action: Setup Terraform');
  
  
  //core.info(JSON.stringify(responseReleases));
  const validVersion = semver.validRange(version, { includePrerelease, loose: true }); // "latest" will return invalid but that's ok because we'll select it by default
	

  if (!validVersion) { // pick the latest release (prereleases will be skipped for safety, set an explicit version instead)
		const releaseVersions = Object.keys(responseReleases.versions).filter(v => !semver.prerelease(v));
		version = releaseVersions.sort((a, b) => semver.rcompare(a, b))[0];
		release = responseReleases.versions[version];
	} else {
		release = matchVersion(responseReleases.versions, validVersion, includePrerelease);
	}

  core.info("Version")
  core.info(JSON.stringify(release));

  
  
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