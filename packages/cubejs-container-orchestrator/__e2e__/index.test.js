const path = require('path');
const { spawn } = require('child_process');
const axios = require('axios');
const io = require('./__fixtures__/socket');
const getSubprocessEnvironment = require('./__fixtures__/getSubprocessEnvironment');

const ENV_FILTER_REGEXP = /^CUBEJS_/i;
const CUBEJS_TEST_EXIT_TIMEOUT = 1000;
let containerOrchestratorEnv;
let containerOrchestratorProcess;
let containerOrchestratorUrl;
let socket;

beforeAll(async () => {
  containerOrchestratorEnv = getSubprocessEnvironment(ENV_FILTER_REGEXP, {
    CUBEJS_TEST_PORT: 32125,
    CUBEJS_TEST_EXIT_TIMEOUT,
  });
  containerOrchestratorUrl = `http://localhost:${containerOrchestratorEnv.CUBEJS_TEST_PORT}`;
  // I may not need to have a detached version right away.
  // I should probably stash this away and simply use the normal
  // spawn method.
  // spawnDetached('node', [path.resolve(__dirname, '../../src/index.js')] );
  containerOrchestratorProcess = spawn('node', [path.resolve(__dirname, '../src/index.js')], {
    stdio: 'inherit',
    shell: true,
    env: containerOrchestratorEnv,
  });
  socket = await io(containerOrchestratorUrl);
});

afterAll(async () => {
  containerOrchestratorProcess.unref();
});

it('should start an express server at specified port', async () => {
  // act
  const { data } = await axios.get(containerOrchestratorUrl);
  // assert
  expect(data).toBe('Hello World!');
});

it(`should close after ${CUBEJS_TEST_EXIT_TIMEOUT}ms when all socket connections close`, async () => {
  let res;
  try {
    // act
    res = await axios.get(containerOrchestratorUrl);
    socket.disconnect();
    await new Promise((resolve) => setTimeout(
      resolve,
      containerOrchestratorEnv.CUBEJS_TEST_EXIT_TIMEOUT + 250
    ));
    await axios.get(containerOrchestratorUrl);
  } catch (err) {
    // assert
    expect(res).not.toBe(undefined);
    expect(err.code).toBe('ECONNREFUSED');
  }
});
