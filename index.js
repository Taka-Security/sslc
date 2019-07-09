#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

const solidityParser = require('solidity-parser-antlr');
const { ArgumentParser } = require('argparse');

const uintRegex = /uint(\d+)/m;
const intRegex = /int(\d+)/m;
const bytesRegex = /bytes(\d+)/m;

const DEFAULT_BRUTE_FORCE_TIMEOUT = 10; // seconds

// source: https://stackoverflow.com/a/37580979
function* genPermutations(permutation) {
  var length = permutation.length,
      c = Array(length).fill(0),
      i = 1, k, p;

  yield permutation.slice();
  while (i < length) {
    if (c[i] < i) {
      k = i % 2 && c[i];
      p = permutation[i];
      permutation[i] = permutation[k];
      permutation[k] = p;
      ++c[i];
      i = 1;
      yield permutation.slice();
    } else {
      c[i] = 0;
      ++i;
    }
  }
};

// source: https://stackoverflow.com/a/1917041
function extractSharedStart(array) {
  // NOTE: if only 1 file, set shared as everything except file name
  if (array.length === 1) return array[0].replace(path.basename(array[0]), '');
  let A = array.concat().sort(), 
      a1 = A[0],
      a2 = A[A.length-1],
      L = a1.length, 
      i = 0;
  while (i < L && a1.charAt(i) === a2.charAt(i)) i++;
  return a1.substring(0, i);
};


// source: https://gist.github.com/tpae/72e1c54471e88b689f85ad2b3940a8f0
class TrieNode {
  constructor(key) {
    this.key = key; // the "key" value will be the character in sequence
    this.parent = null; // we keep a reference to parent
    this.children = {}; // we have hash of children
    this.end = false; // check to see if the node is at the end
  }
  getWord() { // iterates through the parents to get the word. time complexity: O(k), k = word length
    const output = [];
    let node = this;
    while (node !== null) {
      output.unshift(node.key);
      node = node.parent;
    }
    return output.join('');
  }
}
class Trie {
  constructor() {
    this.root = new TrieNode(null); // we implement Trie with just a simple root with null value.
  }
  insert(word) {  // inserts a word into the trie. time complexity: O(k), k = word length
    let node = this.root; // we start at the root 😬
    for (var i = 0; i < word.length; i++) { // for every character in the word
      if (!node.children[word[i]]) { // check to see if character node exists in children.
        node.children[word[i]] = new TrieNode(word[i]); // if it doesn't exist, we then create it.
        node.children[word[i]].parent = node; // we also assign the parent to the child node.
      }
      node = node.children[word[i]]; // proceed to the next depth in the trie.
      if (i == word.length-1) { // finally, we check to see if it's the last word.
        node.end = true; // if it is, we set the end flag to true.
      }
    }
  }
  contains(word) { // check if it contains a whole word. time complexity: O(k), k = word length
    let node = this.root;
    for(var i = 0; i < word.length; i++) { // for every character in the word
      if (node.children[word[i]]) { // check to see if character node exists in children.
        node = node.children[word[i]]; // if it exists, proceed to the next depth of the trie.
      } else { // doesn't exist, return false since it's not a valid word.        
        return false;
      }
    }
    return node.end; // we finished going through all the words, but is it a whole word?
  }
}

function calcMostEfficientLayout(list, bruteforceTimeout) {
  let currentSlotCount = 0;
  
  list = list.slice().sort((a, b) => b - a);
  for (let i = 0; i < list.length;) {
    const item = list[i];
    
    // extract values which are 32 bytes
    if (item === 32) {
      currentSlotCount += 1;
      list.splice(i, 1);
      continue;
    }
  
    // extract pairs of values which together are 32 bytes
    let found_pair = false;
    for (let j = i + 1; j < list.length;) {
      const item_compare = list[j];
      if ((item + item_compare) == 32) {
        found_pair = true;
        // currentSlotCount += 1;
        list.splice(j, 1);
        break;
      }
      j += 1;
    }
    if (found_pair) {
      list.splice(i, 1);
      currentSlotCount += 1;
      continue;
    }
  
    i += 1;
  }
  
  if (!list.length) return { timedout: false, bestSlotCount: currentSlotCount };
  
  // sum all of the remaining variables
  const leftoverBytes = list.reduce((m, x) => m += x, 0);
  
  // if what's left over is less than or equal to 32 bytes (=1 slot)
  if (leftoverBytes <= 32) return { timedout: false, bestSlotCount: currentSlotCount + 1 };
  
  const bestPossibleSlotCount = Math.ceil(leftoverBytes / 32);
  
  // brute-force the remaining items
  let bestSlotCount = 99;
  const trie = new Trie();
  // use a generator to efficiently get 1 permutation on each iteration of the loop
  const now = Date.now();
  
  const timeoutAt = now + bruteforceTimeout * 1000;
  for (const perm of genPermutations(list)) {
    if (Date.now() > timeoutAt) {
      return { timedout: true, bestSlotCount: currentSlotCount + bestSlotCount }; // indicate timeout was triggered
    }
    
    // we store already dealt with permutations in a Trie
    if (trie.contains(perm)) continue;
    trie.insert(perm); 

    // go through each permutation and check if it's more efficient than the currnet (best) permutation
    let slotCount = 1;
    let slotBytesUsed = 0; // 1 slot == 32 bytes
    const slotCounTooHigh = perm.some((varByteSize) => {
      // by using array.some we can 'break' out of the loop by returning a truthy value
      if (slotCount >= bestSlotCount) return true;
      if (slotBytesUsed + varByteSize > 32) {
        // new variable is too big to pack in the current storage slot, we need a new storage slot
        slotBytesUsed = varByteSize;       
        slotCount += 1;
      } else { 
        // new variable can be packed in the current storage slot, no need for extra storage slot
        slotBytesUsed += varByteSize;
        if (slotBytesUsed == 32) {
          slotCount += 1;
          slotBytesUsed = 0;
        }
      }
    });
    
    // if we exit earl, it cannot be a better slot count
    if (!slotCounTooHigh && slotCount < bestSlotCount) {
      bestSlotCount = slotCount;
      if (bestSlotCount === bestPossibleSlotCount) { // return early if possible
        return { timedout: false, bestSlotCount: currentSlotCount + bestSlotCount };
      }
    }
  }
  // we looped through all possibilities, and found the best result to be:
  return { timedout: false, bestSlotCount: currentSlotCount + bestSlotCount} ;
};


function gatherCliArgs() {
  const argParser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'Solidity storage layout checker',
  });

  argParser.addArgument(
    [ '-f' ],
    {
      nargs: '+',
      required: true,
      metavar: 'path',
      help: 'input solidity file(s), supports glob',
      dest: 'solidity_file_paths',
    },
  );

  argParser.addArgument(
    '-oj',
    {
      help: 'write output to JSON file',
      dest: 'output_json_path',
      metavar: 'path',
    },
  );

  argParser.addArgument(
    '-ot',
    {
      help: 'write output to text file',
      dest: 'output_text_path',
      metavar: 'path',
    },
  );
  
  argParser.addArgument(
    '-t',
    {
      help: 'brute force timeout',
      dest: 'bruteforce_timeout',
      metavar: 'secs',
      default: DEFAULT_BRUTE_FORCE_TIMEOUT,
    },
  );

  return argParser.parseArgs();
};

// source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat#Browser_compatibility
function flattenDeep(arr1) {
   return arr1.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
}

function getEnumByteSize(memberCount) {
  if (memberCount <= 255) return 1;
  if (memberCount <= 65535) return 2;
  if (memberCount <= 16777216) return 3;
  if (memberCount <= 4294967295) return 4;
  throw new Error(`a struct cannot have this high number (${memberCount}) of members, it will exceed the block gas limit`);
}

function exec(args) {
  if (!args.bruteforce_timeout) args.bruteforce_timeout = DEFAULT_BRUTE_FORCE_TIMEOUT;
  const sharedPath = extractSharedStart(args.solidity_file_paths);
  const inefficientStructs = {};

  let text = '';
  const textOutput = txt => {
    if (args.output_text_path) text += `${txt}\n`;
    console.log(txt);
  };

  let bruteforceTimedOut = false;
  
  args.solidity_file_paths.forEach((solidity_file_path) => {    
    const uniqueFileName = solidity_file_path.replace(sharedPath, '');
    const input = fs.readFileSync(solidity_file_path, 'utf8');
    const ast = solidityParser.parse(input, { loc: true });
    const structs = flattenDeep(ast.children.filter(child => child.type === 'ContractDefinition')
                    .map(child => child.subNodes.filter(n => n.type === 'StructDefinition').map(n => ({ contract: child.name, ...n }))));
    
    const enums = flattenDeep(ast.children.filter(child => child.type === 'ContractDefinition')
                    .map(child => child.subNodes.filter(n => n.type === 'EnumDefinition').map(n => ({ contract: child.name, ...n }))));
    
    const parsedStructs = structs.reduce((memo, targetStruct) => {
      const structMembers = targetStruct.members.map((targetMember) => {
        const varName = targetMember.name;
        const varLine = targetMember.loc.start.line - 1;
        let varKind;
        let varType;
        let varByteSize;
        let varNestedStructName;
    
        switch (targetMember.typeName.type) {
          case 'UserDefinedTypeName':
            if (enums.length) {
              const foundEnum = enums.find(_enum => _enum.name === targetMember.typeName.namePath);
              if (foundEnum) {
                varKind = 'enum';
                varByteSize = getEnumByteSize(foundEnum.members.length);
                break;
              }
            }
            varKind = 'struct';
            varByteSize = 32;
            break;
          case 'Mapping':
            varKind = 'mapping';
            varByteSize = 32;
            break;
          case 'ArrayTypeName':
            varKind = 'array';
            varByteSize = 32;
            break;
          case 'ElementaryTypeName': {
            let targetMemberType = targetMember.typeName.name;
            varKind = 'elementary';
            varType = targetMemberType;            
            switch (targetMemberType) {
              case 'bytes': varKind = 'array'; varByteSize = 32; break; // NOTE: dynamic size..
              case 'string': varKind = 'array'; varByteSize = 32; break; // NOTE: dynamic size..
              case 'bool': varByteSize = 1; break;
              case 'address': varByteSize = 20; break;
              default:
                if (targetMemberType === 'int' || targetMemberType === 'uint') targetMemberType += '256';
                if (targetMemberType.startsWith('int')) { // intX
                  varByteSize = parseInt(targetMemberType.match(intRegex)[1], 10) / 8;
                  break;
                }
                if (targetMemberType.startsWith('uint')) { // uintX
                  varByteSize = parseInt(targetMemberType.match(uintRegex)[1], 10) / 8;
                  break;
                }
                if (targetMemberType.startsWith('bytes')) { // bytesX
                  varByteSize = parseInt(targetMemberType.match(bytesRegex)[1], 10);
                  break;
                }                  
                throw new Error('unknown type', targetMemberType);
            }
          }
        }
        return { varKind, varByteSize, varType, varLine, varName, varNestedStructName };
      });
      return {
        ...memo,
        [targetStruct.contract]: { 
          ...(memo[targetStruct.contract] || {}),
          [targetStruct.name]: structMembers
        }
      };
    }, {});    
    
    Object.keys(parsedStructs).forEach((contractName) => {
      Object.keys(parsedStructs[contractName]).forEach((structName) => {  
        textOutput(`struct ${structName} { // file: ${uniqueFileName} | contract: ${contractName}\n`);
        let slotsFilledCount = 1;
        let bytesOccupiedInSlot = 0;
        parsedStructs[contractName][structName].forEach((targetMember) => {    
          const newMemberSize = targetMember.varByteSize;
          if (newMemberSize + bytesOccupiedInSlot > 32) {      
            textOutput('  //' + '-'.repeat(10) + ` end of slot | bytes taken: ${bytesOccupiedInSlot} | bytes free: ${32 - bytesOccupiedInSlot}\n`);
            bytesOccupiedInSlot = newMemberSize;        
            slotsFilledCount += 1;      
          } else {      
            bytesOccupiedInSlot += newMemberSize;      
          }
          textOutput(`  ${input.split('\n')[targetMember.varLine].replace(/\/\/.+/, '').trim()} // bytes: ${newMemberSize}`);
        });
        
        const originalSlotsTaken = slotsFilledCount;
          
        const totalBytesTaken = (slotsFilledCount - 1) * 8 + bytesOccupiedInSlot;
        
        // will try and get the most efficient layout, or timeout after x seconds and report best found until then
        const calcResult = calcMostEfficientLayout(parsedStructs[contractName][structName].map(x => x.varByteSize), args.bruteforce_timeout);    
        
        const optimizedSlotsTaken = calcResult.bestSlotCount;
        bruteforceTimedOut = calcResult.timedout;
        
        inefficientStructs[uniqueFileName] = { 
          ...inefficientStructs[uniqueFileName],
          [contractName]: { 
            ...(inefficientStructs[uniqueFileName] ? inefficientStructs[uniqueFileName][contractName] : {}),
            [structName]: { current: slotsFilledCount, optimized: optimizedSlotsTaken, timedout: calcResult.timedout } 
          },
        };
          
        textOutput('  //' + '-'.repeat(10) + ` end of slot | bytes taken: ${bytesOccupiedInSlot} | bytes free: ${32 - bytesOccupiedInSlot}`);
        if (calcResult.timedout) {
          textOutput(`\n} // calculating most efficient layout timed out after ${args.bruteforce_timeout} seconds`);
          textOutput(`  // best found result before timeout: slots that can be saved = ${slotsFilledCount - optimizedSlotsTaken}\n`);    
        }
        textOutput(`\n} // slots that can be saved = ${slotsFilledCount - optimizedSlotsTaken}\n`);  
      });
    });
  });
  
  textOutput('// STRUCTS THAT CAN BE OPTIMIZED');
  textOutput('// =============================');
  let foundStructThatCanBeOptimized = false;
  const jsonOutput = [];
  Object.keys(inefficientStructs).forEach((inputFilePath) => {
    Object.keys(inefficientStructs[inputFilePath]).forEach((contractName) => {
      Object.keys(inefficientStructs[inputFilePath][contractName]).forEach((structName) => {
        const structSummary = inefficientStructs[inputFilePath][contractName][structName];
        if (structSummary.current > structSummary.optimized) {
          if (!foundStructThatCanBeOptimized) {
            foundStructThatCanBeOptimized = true;
          }
          textOutput(`// file: ${inputFilePath}`);
          textOutput(`// contract: ${contractName}`);
          textOutput(`// struct: ${structName}`);
          if (bruteforceTimedOut) {
            textOutput(`// timed out: yes, after ${args.bruteforce_timeout}s`);
            textOutput(`// best found slots saved: ${structSummary.current - structSummary.optimized}`);
          } else {
            textOutput(`// slots saved: ${structSummary.current - structSummary.optimized}`);
          }
          
          textOutput('// -----------------------------');
          if (args.output_json_path) {
            jsonOutput.push({
              file: inputFilePath,
              contract: contractName,
              struct: structName,              
              slotsSaved: structSummary.current - structSummary.optimized, 
              timedout: bruteforceTimedOut,
            });
          }
        }
      });
    });
  });
  
  if (!foundStructThatCanBeOptimized) {
    textOutput('// All structs seem to be efficiently laid out in memory');
  }
  
  if (foundStructThatCanBeOptimized && args.output_json_path) {
    fs.writeFileSync(args.output_json_path, JSON.stringify(jsonOutput, null, 4));
  }
  
  if (args.output_text_path) {
    fs.writeFileSync(args.output_text_path, text);
  }
}

if (require.main === module) {
  exec(gatherCliArgs());
} else {
  module.exports = exec;
}