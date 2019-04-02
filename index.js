#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

const solidityParser = require('solidity-parser-antlr');
const { ArgumentParser } = require('argparse');

const uintRegex = /uint(\d+)/m;
const intRegex = /int(\d+)/m;
const bytesRegex = /bytes(\d+)/m;

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

function calcStructStorageSlotCount(structMembers) {
  const byteSizesList = structMembers.map(m => m.varByteSize); // we are only interested in the combinations of variable byte sizes
  const byteSizesListNoBytes32 = byteSizesList.filter(b => b < 32); // we remove 32 byte vars from the list to check
  const trie = new Trie();
  let bestSlotCount = 99;
  for (const perm of genPermutations(byteSizesListNoBytes32)) { // uses yield
    if (trie.contains(perm)) continue; // ignore already visited permutations
    trie.insert(perm); 
    let slotCount = 1; // to keep track of how many storage slots the current permutation is occupying
    let slotBytesUsed = 0; // how many bytes are occupied by data, max in 1 storage slot = 32
    for (let i = 0, len = perm.length; i < len; i += 1) { // loop items of permutation
      if (slotCount >= bestSlotCount) break; // this permutiation is already not the best, goto next permutation
      const varByteSize = perm[i];
      if (slotBytesUsed + varByteSize > 32) { // new variable cannot be saved in current storage slot, we need a new one.
        slotBytesUsed = varByteSize;       
        slotCount += 1;
      } else { // new variable can be packed inside the current storage variable. no need for extra storage slot
        slotBytesUsed += varByteSize;
      }
    }
    if (slotCount < bestSlotCount) bestSlotCount = slotCount;
  }
  const byteSizesListBytes32Count = byteSizesList.length - byteSizesListNoBytes32.length;
  return bestSlotCount + byteSizesListBytes32Count;
};


function gatherCliArgs() {
  const argParser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'Solidity struct layout checker',
  });

  argParser.addArgument(
    [ '-f' ],
    {
      nargs: '+',
      required: true,
      metavar: 'path',
      help: 'input solidity file(s), supports glob',
      dest: 'input_file_paths',
    },
  );

  argParser.addArgument(
    '--only-last',
    {
      type: Boolean,
      defaultValue: false,
      help: 'use only last contract in input file',
      dest: 'only_last_contract',
      action: 'storeTrue',
    },
  );

  return argParser.parseArgs();
};

function exec(args) {
  const sharedPath = extractSharedStart(args.input_file_paths);
  const inefficientStructs = {};

  try {
    args.input_file_paths.forEach((input_file_path) => {    
      const uniqueFileName = input_file_path.replace(sharedPath, '');
      const input = fs.readFileSync(input_file_path, 'utf8');
      const ast = solidityParser.parse(input, { loc: true });
      
      const structs = args.only_last_contract
        ? ast.children[ast.children.length - 1].subNodes.filter(n => n.type === 'StructDefinition').map(n => ({ contract: ast.children[ast.children.length - 1].name, ...n }))
        : ast.children.filter(child => child.type === 'ContractDefinition')
                      .map(child => child.subNodes.filter(n => n.type === 'StructDefinition').map(n => ({ contract: child.name, ...n })))
                      .flat();
      
      const parsedStructs = structs.reduce((memo, targetStruct) => {
        const structMembers = targetStruct.members.map((targetMember) => {
          const varName = targetMember.name;
          const varLine = targetMember.loc.start.line - 1;
          let varKind;
          let varType;
          let varByteSize;
          switch (targetMember.typeName.type) {
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
          return { varKind, varByteSize, varType, varLine };
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
          console.log(`struct ${structName} { // file: ${uniqueFileName} | contract: ${contractName}\n`);
          let slotCount = 1;
          let storageSlotByteCount = 0;
          parsedStructs[contractName][structName].forEach((targetMember) => {
            if (targetMember.varByteSize + storageSlotByteCount > 32) {
              console.log('  //' + '-'.repeat(10) + ` end of slot ${slotCount} | bytes taken: ${storageSlotByteCount} | bytes free: ${32 - storageSlotByteCount}\n`);
              storageSlotByteCount = targetMember.varByteSize;        
              slotCount += 1;
            } else {
              storageSlotByteCount += targetMember.varByteSize;
            }
            console.log(`  ${input.split('\n')[targetMember.varLine].replace(/\/\/.+/, '').trim()} // bytes: ${targetMember.varByteSize}`);
          });
          
          const optimizedSlotCount = calcStructStorageSlotCount(parsedStructs[contractName][structName].slice().sort((a, b) => a.varByteSize - b.varByteSize));
          inefficientStructs[uniqueFileName] = { 
            ...inefficientStructs[uniqueFileName],
            [contractName]: { 
              ...(inefficientStructs[uniqueFileName] ? inefficientStructs[uniqueFileName][contractName] : {}),
              [structName]: { current: slotCount, optimized: optimizedSlotCount } 
            },
          };
          console.log('  //' + '-'.repeat(10) + ` end of slot ${slotCount} | bytes taken: ${storageSlotByteCount} | bytes free: ${32 - storageSlotByteCount}`);
          console.log(`\n} // current slot count = ${slotCount} | optimized slot count = ${optimizedSlotCount}\n`);
        });
      });
    });
    
    console.log('// STRUCTS THAT CAN BE OPTIMIZED');
    console.log('// =============================');
    let foundStructThatCanBeOptimized = false;
    Object.keys(inefficientStructs).forEach((inputFilePath) => {
      Object.keys(inefficientStructs[inputFilePath]).forEach((contractName) => {
        Object.keys(inefficientStructs[inputFilePath][contractName]).forEach((structName) => {
          const structSummary = inefficientStructs[inputFilePath][contractName][structName];
          if (structSummary.current > structSummary.optimized) {
            if (!foundStructThatCanBeOptimized) {
              foundStructThatCanBeOptimized = true;
            }
            console.log(`// file: ${inputFilePath}`);
            console.log(`// contract: ${contractName}`);
            console.log(`// struct: ${structName}`);
            console.log(`// current num storage slots: ${structSummary.current}`);
            console.log(`// possible num storage slots: ${structSummary.optimized}`);
            console.log('// -----------------------------');
          }
        });
      });
    });
    
    if (!foundStructThatCanBeOptimized) {
      console.log('// All structs seem to be efficiently laid out in memory');
    }
    
  } catch (e) {
    if (e instanceof solidityParser.ParserError) {
      console.log('solidity parser error', e.errors)
    } else {
      throw e;
    }
  }
};

if (require.main === module) {
  exec(gatherCliArgs());
} else {
  module.exports = exec;
}