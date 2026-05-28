const chalk = require('chalk');

jest.spyOn(console, 'log').mockImplementation((...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('[dotenv')) {
    return; // suppress dotenv logs
  }
  console.info(...args); // safer than process.stdout.write
});

afterEach(() => {
  const state = expect.getState();
  const failed = state.assertionCalls > state.numPassingAsserts;

  if (failed && global.lastResponse) {
    console.log(
      '\n' + chalk.bgRed.white.bold(' TEST FAILED '),
      chalk.white(` ${state.currentTestName}`)
    );
    console.log(
      chalk.blue.bold('🔹 Actual Response:'),
      JSON.stringify(
        {
          status: global.lastResponse.statusCode,
          body: global.lastResponse.body,
        },
        null,
        2
      )
    );
    console.log(chalk.gray('────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────'));
  }
});
