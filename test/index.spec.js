const path = require('path');
const fs = require('fs');

const { expect } = require('chai');

const cli = require('../index');

const TEST_JSON_OUTPUT_PATH = path.join(__dirname, 'test_files', `test.output.json`);
const TEST_TEXT_OUTPUT_PATH = path.join(__dirname, 'test_files', `test.output.txt`);

const cleanup = filePath => fs.existsSync(filePath) && fs.unlinkSync(filePath)

describe('sslc', () => {
  beforeEach(() => {
    cleanup(TEST_JSON_OUTPUT_PATH);
    cleanup(TEST_TEXT_OUTPUT_PATH);
  });
  after(() => {
    cleanup(TEST_JSON_OUTPUT_PATH);
    cleanup(TEST_TEXT_OUTPUT_PATH);
  });
  for (let test = 1; test <= 14; test += 1) {
    it(`should give correct output for Test${test}.sol`, () => {
      cli({
        solidity_file_paths: [path.join(__dirname, 'test_files', `Test${test}.sol`)],
        output_json_path: TEST_JSON_OUTPUT_PATH,
        output_text_path: TEST_TEXT_OUTPUT_PATH,
      });
      
      const expectedTextPath = path.join(__dirname, 'test_files', `Test${test}.expected.sol`); // the tool text output uses solidity syntax
      const expectedJsonPath = path.join(__dirname, 'test_files', `Test${test}.expected.json`);
      
      expect(fs.readFileSync(expectedTextPath, 'utf8')).to.equal(fs.readFileSync(TEST_TEXT_OUTPUT_PATH, 'utf8'), 'XYZ expected text file does not match actual text output');
      
      if (fs.existsSync(expectedJsonPath)) {
        expect(fs.existsSync(TEST_JSON_OUTPUT_PATH)).to.equal(true, 'expected a json output file but none was generated');
      }
      if (fs.existsSync(TEST_JSON_OUTPUT_PATH)) {
        expect(fs.existsSync(expectedJsonPath)).to.equal(true, 'json output file was generated, but expected none');
      }
      if (fs.existsSync(expectedJsonPath)) {
        expect(fs.readFileSync(expectedJsonPath, 'utf8')).to.equal(fs.readFileSync(TEST_JSON_OUTPUT_PATH, 'utf8'), 'expected json file does not match actual json output');
      }      
    });
  }
});
