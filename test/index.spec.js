const path = require('path');
const fs = require('fs');

const { expect } = require('chai');
const { stdout } = require('test-console');

const cli = require('../index');

const TEST_COUNT = 10;
const TEST_JSON_OUTPUT_PATH = path.join(__dirname, 'test_files', `test.output.json`);

describe('sslc', () => {
  beforeEach(() => fs.existsSync(TEST_JSON_OUTPUT_PATH) && fs.unlinkSync(TEST_JSON_OUTPUT_PATH));
  after(() => fs.existsSync(TEST_JSON_OUTPUT_PATH) && fs.unlinkSync(TEST_JSON_OUTPUT_PATH));
  for (let test = 10; test <= TEST_COUNT; test += 1) {
    it(`should give correct output for Test${test}.sol`, () => {
      // const output = stdout.inspectSync(() => {
        cli({
          solidity_file_paths: [path.join(__dirname, 'test_files', `Test${test}.sol`)],
          output_json_path: TEST_JSON_OUTPUT_PATH,
        });
      // });  
      const expectedTextPath = path.join(__dirname, 'test_files', `Test${test}.expected.sol`); 
      const expectedJsonPath = path.join(__dirname, 'test_files', `Test${test}.expected.json`);
      
      // expect(output.join('')).to.equal(fs.readFileSync(expectedTextPath, 'utf8'), 'text output did not match expected');
      // 
      // if (fs.existsSync(expectedJsonPath)) {
      //   expect(fs.existsSync(TEST_JSON_OUTPUT_PATH)).to.equal(true, 'expected a json output file but none was generated');
      // }
      // if (fs.existsSync(TEST_JSON_OUTPUT_PATH)) {
      //   expect(fs.existsSync(expectedJsonPath)).to.equal(true, 'json output file was generated, but expected none');
      // }
      // if (fs.existsSync(expectedJsonPath)) {
      //   expect(fs.readFileSync(expectedJsonPath, 'utf8')).to.equal(fs.readFileSync(TEST_JSON_OUTPUT_PATH, 'utf8'), 'expected json file does not match actual json output');
      // }      
    });
  }
});
