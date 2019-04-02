const path = require('path');
const fs = require('fs');

const { expect } = require('chai');
const { stdout } = require('test-console');

const cli = require('../index');

describe('sslc', () => {
  it('should give correct output for Test1.sol', () => {
    const output = stdout.inspectSync(() => {
      cli({
        input_file_paths: [
          path.join(__dirname, 'solidity_files', 'Test1.sol'),
        ],
      });
    });  
    expect(output.join('')).to.equal(fs.readFileSync(path.join(__dirname, 'solidity_files', 'Test1.expected.sol'), 'utf8'));
  });
  it('should give correct output for Test2.sol', () => {
    const output = stdout.inspectSync(() => {
      cli({
        input_file_paths: [
          path.join(__dirname, 'solidity_files', 'Test2.sol'),
        ],
      });
    });  
    expect(output.join('')).to.equal(fs.readFileSync(path.join(__dirname, 'solidity_files', 'Test2.expected.sol'), 'utf8'));
  });
  it('should give correct output for Test3.sol', () => {
    const output = stdout.inspectSync(() => {
      cli({
        input_file_paths: [
          path.join(__dirname, 'solidity_files', 'Test3.sol'),
        ],
      });
    });  
    expect(output.join('')).to.equal(fs.readFileSync(path.join(__dirname, 'solidity_files', 'Test3.expected.sol'), 'utf8'));
  });
  it('should give correct output for Test4.sol', () => {
    const output = stdout.inspectSync(() => {
      cli({
        input_file_paths: [
          path.join(__dirname, 'solidity_files', 'Test4.sol'),
        ],
      });
    });  
    expect(output.join('')).to.equal(fs.readFileSync(path.join(__dirname, 'solidity_files', 'Test4.expected.sol'), 'utf8'));
  });
  it('should give correct output for Test5.sol', () => {
    const output = stdout.inspectSync(() => {
      cli({
        input_file_paths: [
          path.join(__dirname, 'solidity_files', 'Test5.sol'),
        ],
      });
    });  
    expect(output.join('')).to.equal(fs.readFileSync(path.join(__dirname, 'solidity_files', 'Test5.expected.sol'), 'utf8'));
  });
});
