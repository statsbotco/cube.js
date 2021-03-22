import fs from 'fs-extra';
import path from 'path';
import cliProgress from 'cli-progress';
import { CommanderStatic } from 'commander';
import { CubeCloudClient, DeployDirectory } from '@cubejs-backend/cloud';

import { logStage, displayError, event } from '../utils';
import { Config } from '../config';

const deploy = async ({ directory, auth, uploadEnv, token }: any) => {
  if (!(await fs.pathExists(path.join(process.cwd(), 'node_modules', '@cubejs-backend/server-core')))) {
    await displayError(
      '@cubejs-backend/server-core dependency not found. Please run deploy command from project root directory and ensure npm install has been run.'
    );
  }

  if (token) {
    const config = new Config();
    await config.addAuthToken(token);

    await event({
      event: 'Cube Cloud CLI Authenticate'
    });

    console.log('Token successfully added!');
  }

  const config = new Config();
  if (!auth) auth = await config.deployAuthForCurrentDir();

  const cubeCloudClient = new CubeCloudClient();

  const bar = new cliProgress.SingleBar({
    format: '- Uploading files | {bar} | {percentage}% || {value} / {total} | {file}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });

  const deployDir = new DeployDirectory({ directory });
  const fileHashes: any = await deployDir.fileHashes();

  const upstreamHashes = await cubeCloudClient.getUpstreamHashes({ auth });
  const { transaction, deploymentName } = await cubeCloudClient.startUpload({ auth });

  if (uploadEnv) {
    const envVariables = await config.envFile(`${directory}/.env`);
    await cubeCloudClient.setEnvVars({ auth, envVariables });
  }

  await logStage(`Deploying ${deploymentName}...`, 'Cube Cloud CLI Deploy');

  const files = Object.keys(fileHashes);
  const fileHashesPosix = {};

  bar.start(files.length, 0, {
    file: ''
  });

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      bar.update(i, { file });

      const filePosix = file.split(path.sep).join(path.posix.sep);
      fileHashesPosix[filePosix] = fileHashes[file];

      if (!upstreamHashes[filePosix] || upstreamHashes[filePosix].hash !== fileHashes[file].hash) {
        await cubeCloudClient.uploadFile({
          transaction,
          fileName: filePosix,
          data: fs.createReadStream(path.join(directory, file)),
          auth
        });
      }
    }
    bar.update(files.length, { file: 'Post processing...' });
    await cubeCloudClient.finishUpload({
      transaction,
      files: fileHashesPosix,
      auth
    });
  } finally {
    bar.stop();
  }

  await logStage('Done 🎉', 'Cube Cloud CLI Deploy Success');
};

export function configureDeployCommand(program: CommanderStatic) {
  program
    .command('deploy')
    .description('Deploy project to Cube Cloud')
    .option('--upload-env', 'Upload .env file to CubeCloud')
    .option('--token <token>', 'Add auth token to CubeCloud')
    .action(
      (options) => deploy({ directory: process.cwd(), ...options })
        .catch(e => displayError(e.stack || e))
    )
    .on('--help', () => {
      console.log('');
      console.log('Examples:');
      console.log('');
      console.log('  $ cubejs deploy');
    });
}
