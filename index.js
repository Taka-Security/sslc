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
  let currentSlotCount = 0;
  const byteSizesList = structMembers.map(m => m.varByteSize).sort((a, b) => b - a); // we are only interested in the combinations of variable byte sizes
  
  // remove all variables of byte size 32 from the list to brute force
  let byteSizesList32OrHigher = byteSizesList.filter(b => b >= 32); // we remove 32 or more byte vars from the list to check
  byteSizesList32OrHigher.forEach(b => currentSlotCount += b / 32);
  let byteSizesListToDo = byteSizesList.filter(b => b < 32);
  
  // if all variables are 32 bytes
  if (!byteSizesListToDo.length) return currentSlotCount;
  
  // find all pairs that together make up 32 bytes
  let byteSizesListPairs = [];
  const used = {};
  for (let i = 0; i < byteSizesListToDo.length; i += 1) {
    if (used[i]) continue;
    for (let j = 0; j < byteSizesListToDo.length; j += 1) {
      if (used[i]) break;
      if (i == j || used[j]) continue;
      if (byteSizesListToDo[i] + byteSizesListToDo[j] === 32) {
        byteSizesListPairs.push(byteSizesListToDo[i], byteSizesListToDo[j]);
        used[i] = true;
        used[j] = true;
        break;
      }
    }
  }
  if (byteSizesListPairs.length) {
    // increment slots by 1 for each pair
    currentSlotCount += byteSizesListPairs.length / 2;
  
    // remove found pairs from the list to do
    for (let i = 0; i < byteSizesListPairs.length; i++) {
      for (let j = 0; j < byteSizesListToDo.length;) {
        if (byteSizesListPairs[i] === byteSizesListToDo[j]) {
          byteSizesListToDo.splice(j, 1);
        } else {
          j++;
        }
      }
    }
  }
  
  // if all remaining variables together made 32 byte pairs
  if (!byteSizesListToDo.length) return currentSlotCount;
  
  // brute-force the remaining items
  let bestSlotCount = 99;
  const trie = new Trie();
  
  // use a generator to efficiently get 1 permutation on each iteration of the loop
  for (const perm of genPermutations(byteSizesListToDo)) {
    // we store already dealt with permutations in a Trie
    if (trie.contains(perm)) continue;
    trie.insert(perm); 
    
    // go through each permutation and check if it's more efficient than the currnet (best) permutation
    let slotCount = 1;
    let slotBytesUsed = 0; // 1 slot == 32 bytes
    const exitEarly = perm.some((varByteSize) => {
      // by using array.some we can 'break' out of the loop by returning a truthy value
      if (slotCount >= bestSlotCount) return true;
      if (slotBytesUsed + varByteSize > 32) {
        // new variable is too big to pack in the current storage slot, we need a new storage slot
        slotBytesUsed = varByteSize;       
        slotCount += 1;
      } else { 
        // new variable can be packed in the current storage slot, no need for extra storage slot
        slotBytesUsed += varByteSize;
      }
    });
    // if we exit earl, it cannot be a better slot count
    if (!exitEarly && slotCount < bestSlotCount) bestSlotCount = slotCount;
  }
  
  return currentSlotCount + bestSlotCount;
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

  return argParser.parseArgs();
};

function exec(args) {
  const sharedPath = extractSharedStart(args.solidity_file_paths);
  const inefficientStructs = {};

  let text = '';
  const textOutput = txt => {
    if (args.output_text_path) text += `${txt}\n`;
    console.log(txt);
  };

  args.solidity_file_paths.forEach((solidity_file_path) => {    
    const uniqueFileName = solidity_file_path.replace(sharedPath, '');
    const input = fs.readFileSync(solidity_file_path, 'utf8');
    const ast = solidityParser.parse(input, { loc: true });
    const structs = ast.children.filter(child => child.type === 'ContractDefinition')
                    .map(child => child.subNodes.filter(n => n.type === 'StructDefinition').map(n => ({ contract: child.name, ...n })))
                    .flat();
    
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
        let slotCount = 1;
        let storageSlotByteCount = 0;
        parsedStructs[contractName][structName].forEach((targetMember) => {
          if (targetMember.varByteSize + storageSlotByteCount > 32) {
            textOutput('  //' + '-'.repeat(10) + ` end of slot ${slotCount} | bytes taken: ${storageSlotByteCount} | bytes free: ${32 - storageSlotByteCount}\n`);
            storageSlotByteCount = targetMember.varByteSize;        
            slotCount += 1;
          } else {
            storageSlotByteCount += targetMember.varByteSize;
          }
          textOutput(`  ${input.split('\n')[targetMember.varLine].replace(/\/\/.+/, '').trim()} // bytes: ${targetMember.varByteSize}`);
        });
        const totalBytesTaken = (slotCount - 1) * 8 + storageSlotByteCount;
        
        const optimizedSlotCount = calcStructStorageSlotCount(parsedStructs[contractName][structName].slice().sort((a, b) => a.varByteSize - b.varByteSize));
        inefficientStructs[uniqueFileName] = { 
          ...inefficientStructs[uniqueFileName],
          [contractName]: { 
            ...(inefficientStructs[uniqueFileName] ? inefficientStructs[uniqueFileName][contractName] : {}),
            [structName]: { current: slotCount, optimized: optimizedSlotCount } 
          },
        };
        textOutput('  //' + '-'.repeat(10) + ` end of slot ${slotCount} | bytes taken: ${storageSlotByteCount} | bytes free: ${32 - storageSlotByteCount}`);
        textOutput(`\n} // slots that can be saved = ${slotCount - optimizedSlotCount}\n`);
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
          textOutput(`// slots saved: ${structSummary.current - structSummary.optimized}`);
          textOutput('// -----------------------------');
          if (args.output_json_path) {
            jsonOutput.push({
              file: inputFilePath,
              contract: contractName,
              struct: structName,              
              slotsSaved: structSummary.current - structSummary.optimized, 
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