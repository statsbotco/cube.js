import inquirer from 'inquirer';
import fs from 'fs-extra';
import jwt from 'jsonwebtoken';
import path from 'path';
import os from 'os';
import dotenv from '@cubejs-backend/dotenv';
import { isFilePath } from '@cubejs-backend/shared';
import { CubeCloudClient } from '@cubejs-backend/cloud';
import { displayWarning } from './utils';

type ConfigurationFull = {
  auth: {
    [organizationUrl: string]: {
      auth: string,
    }
  }
};

type Configuration = Partial<ConfigurationFull>;

export class Config {
  private cubeCloudClient = new CubeCloudClient();

  protected async loadConfig(): Promise<Configuration> {
    const { configFile } = this.configFile();

    if (await fs.pathExists(configFile)) {
      return fs.readJson(configFile);
    }

    return {};
  }

  protected async writeConfig(config) {
    const { cubeCloudConfigPath, configFile } = this.configFile();
    await fs.mkdirp(cubeCloudConfigPath);
    await fs.writeJson(configFile, config);
  }

  protected configFile() {
    const cubeCloudConfigPath = this.cubeCloudConfigPath();
    const configFile = path.join(cubeCloudConfigPath, 'config.json');

    return { cubeCloudConfigPath, configFile };
  }

  public async envFile(envFile: string) {
    if (await fs.pathExists(envFile)) {
      const env = dotenv.config({ path: envFile, multiline: 'line-breaks' }).parsed;
      if (env) {
        if ('CUBEJS_DEV_MODE' in env) {
          delete env.CUBEJS_DEV_MODE;
        }

        const resolvePossibleFiles = [
          'CUBEJS_DB_SSL_CA',
          'CUBEJS_DB_SSL_CERT',
          'CUBEJS_DB_SSL_KEY',
        ];

        // eslint-disable-next-line no-restricted-syntax
        for (const [key, value] of Object.entries(env)) {
          if (resolvePossibleFiles.includes(key) && isFilePath(value)) {
            if (fs.existsSync(value)) {
              env[key] = fs.readFileSync(value, 'ascii');
            } else {
              displayWarning(`Unable to resolve file "${value}" from ${key}`);

              env[key] = '';
            }
          }
        }

        return env;
      }
    }

    return {};
  }

  protected cubeEnvConfigPath() {
    return path.join(os.homedir(), '.env');
  }

  protected cubeCloudConfigPath() {
    return path.join(os.homedir(), '.cubecloud');
  }

  public async deployAuth(url?: string) {
    const config = await this.loadConfig();

    if (process.env.CUBE_CLOUD_DEPLOY_AUTH) {
      return (await this.addAuthToken(process.env.CUBE_CLOUD_DEPLOY_AUTH, config)).auth;
    }

    if (config.auth) {
      return config.auth;
    }

    const auth = await inquirer.prompt([{
      name: 'auth',
      message: `Cube Cloud Auth Token${url ? ` for ${url}` : ''}`
    }]);

    return (await this.addAuthToken(auth.auth, config)).auth;
  }

  public async addAuthToken(authToken: string, config?: Configuration): Promise<ConfigurationFull> {
    if (!config) {
      config = await this.loadConfig();
    }

    const payload = jwt.decode(authToken);
    if (payload && typeof payload === 'object' && payload.url) {
      config.auth = config.auth || {};
      config.auth[payload.url] = {
        auth: authToken
      };

      if (payload.deploymentId) {
        const dotCubeCloud = await this.loadDotCubeCloud();
        dotCubeCloud.url = payload.url;
        dotCubeCloud.deploymentId = payload.deploymentId;
        await this.writeDotCubeCloud(dotCubeCloud);
      }

      await this.writeConfig(config);
      return <ConfigurationFull>config;
    }

    const answer = await this.cubeCloudClient.getDeploymentToken(authToken);
    if (answer) {
      return this.addAuthToken(answer, config);
    }

    // eslint-disable-next-line no-throw-literal
    throw 'Malformed Cube Cloud token';
  }

  public async deployAuthForCurrentDir() {
    const dotCubeCloud = await this.loadDotCubeCloud();
    if (dotCubeCloud.url && dotCubeCloud.deploymentId) {
      const deployAuth = await this.deployAuth(dotCubeCloud.url);
      if (!deployAuth[dotCubeCloud.url]) {
        throw new Error(`Provided token isn't for ${dotCubeCloud.url}`);
      }

      return {
        ...deployAuth[dotCubeCloud.url],
        url: dotCubeCloud.url,
        deploymentId: dotCubeCloud.deploymentId
      };
    }

    const auth = await this.deployAuth();
    let url = Object.keys(auth)[0];
    if (Object.keys(auth).length > 1) {
      // eslint-disable-next-line prefer-destructuring
      url = (await inquirer.prompt([{
        type: 'list',
        name: 'url',
        message: 'Please select an organization',
        choices: Object.keys(auth)
      }])).url;
    }

    const authToken = auth[url];
    const deployments = await this.cubeCloudClient.getDeploymentsList({ auth: { ...authToken, url } });

    if (!Array.isArray(deployments)) {
      throw new Error(deployments.toString());
    }

    if (!deployments.length) {
      // eslint-disable-next-line no-throw-literal
      throw `${url} doesn't have any managed deployments. Please create one.`;
    }

    let deploymentId = deployments[0].id;
    if (deployments.length > 1) {
      const { deployment } = await inquirer.prompt([{
        type: 'list',
        name: 'deployment',
        message: 'Please select a deployment to deploy to',
        choices: deployments
      }]);
      deploymentId = deployments.find(d => d.name === deployment).id;
    }

    await this.writeDotCubeCloud({
      url,
      deploymentId
    });

    return {
      ...authToken,
      url,
      deploymentId
    };
  }

  protected dotCubeCloudFile() {
    return '.cubecloud';
  }

  protected async loadDotCubeCloud() {
    if (await fs.pathExists(this.dotCubeCloudFile())) {
      return fs.readJson(this.dotCubeCloudFile());
    }

    return {};
  }

  protected async writeDotCubeCloud(config) {
    await fs.writeJson(this.dotCubeCloudFile(), config);
  }
}
