// arch in [arm, x32, x64...] (https://nodejs.org/api/os.html#os_os_arch)
// return value in [amd64, 386, arm]
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


/*   async function downloadCLI (url) {
    core.debug(`Downloading Terraform CLI from ${url}`);
    const pathToCLIZip = await tc.downloadTool(url);
  
    core.debug('Extracting Terraform CLI zip file');
    const pathToCLI = await tc.extractZip(pathToCLIZip);
    core.debug(`Terraform CLI path is ${pathToCLI}.`);
  
    if (!pathToCLIZip || !pathToCLI) {
      throw new Error(`Unable to download Terraform from ${url}`);
    }
  
    return pathToCLI;
  } */

  /* async function installWrapper (pathToCLI) {
    let source, target;
  
    // If we're on Windows, then the executable ends with .exe
    const exeSuffix = os.platform().startsWith('win') ? '.exe' : '';
  
    // Rename terraform(.exe) to terraform-bin(.exe)
    try {
      source = [pathToCLI, `terraform${exeSuffix}`].join(path.sep);
      target = [pathToCLI, `terraform-bin${exeSuffix}`].join(path.sep);
      core.debug(`Moving ${source} to ${target}.`);
      await io.mv(source, target);
    } catch (e) {
      core.error(`Unable to move ${source} to ${target}.`);
      throw e;
    }
  
    // Install our wrapper as terraform
    try {
      source = path.resolve([__dirname, '..', 'wrapper', 'dist', 'index.js'].join(path.sep));
      target = [pathToCLI, 'terraform'].join(path.sep);
      core.debug(`Copying ${source} to ${target}.`);
      await io.cp(source, target);
    } catch (e) {
      core.error(`Unable to copy ${source} to ${target}.`);
      throw e;
    }
  
    // Export a new environment variable, so our wrapper can locate the binary
    core.exportVariable('TERRAFORM_CLI_PATH', pathToCLI);
  } */