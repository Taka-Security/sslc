#!/usr/bin/env node

const fs = require('fs');

const solidityParser = require('solidity-parser-antlr');
const { ArgumentParser } = require('argparse');

const uintRegex = /uint(\d+)/m;
const intRegex = /int(\d+)/m;
const bytesRegex = /bytes(\d+)/m;

// source: https://stackoverflow.com/a/37580979
const genPermutations = (permutation) => {
  var length = permutation.length,
      result = [permutation.slice()],
      c = new Array(length).fill(0),
      i = 1, k, p;

  while (i < length) {
    if (c[i] < i) {
      k = i % 2 && c[i];
      p = permutation[i];
      permutation[i] = permutation[k];
      permutation[k] = p;
      ++c[i];
      i = 1;
      result.push(permutation.slice());
    } else {
      c[i] = 0;
      ++i;
    }
  }
  return result;
};

const calcStructStorageSlotCount = (structMembers) => {
  const allPermutations = genPermutations(structMembers);
  let bestSlotCount = 99;
  
  // go through all permutations of struct members
  allPermutations.forEach((structMembersCandidate) => {
    let slotCount = 1;
    let storageSlotByteCount = 0;
    structMembersCandidate.forEach((targetMember) => {
      if (slotCount >= bestSlotCount) return;
      if (targetMember.varByteSize + storageSlotByteCount > 32) {
        storageSlotByteCount = targetMember.varByteSize;        
        slotCount += 1;
      } else {
        storageSlotByteCount += targetMember.varByteSize;
      }
    });
    if (slotCount < bestSlotCount) bestSlotCount = slotCount;
  });
  
  return bestSlotCount;
};

// source: https://stackoverflow.com/a/1917041
const sharedStart = (array) => {
  let A = array.concat().sort(), 
      a1 = A[0],
      a2 = A[A.length-1],
      L = a1.length, 
      i = 0;
  while (i < L && a1.charAt(i) === a2.charAt(i)) i++;
  return a1.substring(0, i);
};

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

const args = argParser.parseArgs();

const sharedPath = sharedStart(args.input_file_paths);

const summary_can_be_more_efficient = {};

try {
  args.input_file_paths.forEach((input_file_path) => {    
    const unique_file_name = input_file_path.replace(sharedPath, '');
    const results = {};

    const input = fs.readFileSync(input_file_path, 'utf8');
    const ast = solidityParser.parse(input, { loc: true });

    const structs = args.only_last_contract
      ? ast.children[ast.children.length - 1].subNodes.filter(n => n.type === 'StructDefinition')
      : ast.children.filter(child => child.type === 'ContractDefinition')
                    .map(child => child.subNodes.filter(n => n.type === 'StructDefinition'))
                    .flat();
    
    structs.forEach((targetStruct) => {
      const structResult = [];
      targetStruct.members.forEach((targetMember) => {
        switch (targetMember.typeName.type) {
          case 'Mapping':
            structResult.push({
              varName: targetMember.name,
              varKind: 'mapping',
              varByteSize: 32,
              varLine: targetMember.loc.start.line - 1,
            });
            return;
          case 'ArrayTypeName':
            structResult.push({
              varName: targetMember.name,
              varKind: 'array',
              varByteSize: 32,
              varLine: targetMember.loc.start.line - 1,
            });
            return;
          case 'ElementaryTypeName':
            let targetMemberType = targetMember.typeName.name;
            
            if (targetMemberType.startsWith('int')) {
              if (targetMemberType === 'int') targetMemberType = 'int256';
              structResult.push({
                varName: targetMember.name,
                varType: targetMemberType,
                varKind: 'elementary',
                varByteSize: parseInt(targetMemberType.match(intRegex)[1], 10) / 8,
                varLine: targetMember.loc.start.line - 1,
              });
              return;
            }
            
            if (targetMemberType.startsWith('uint')) {
              if (targetMemberType === 'uint') targetMemberType = 'uint256';
              structResult.push({
                varName: targetMember.name,
                varType: targetMemberType,
                varKind: 'elementary',
                varByteSize: parseInt(targetMemberType.match(uintRegex)[1], 10) / 8,
                varLine: targetMember.loc.start.line - 1,
              });
              return;
            }
            
            if (targetMemberType === 'bytes') {
              structResult.push({
                varName: targetMember.name,
                varType: targetMemberType,
                varKind: 'elementary', // it's really a dynamic array
                varByteSize: 32,
                varLine: targetMember.loc.start.line - 1,
              });
              return;  
            }
            
            if (targetMemberType.startsWith('bytes')) {
              structResult.push({
                varName: targetMember.name,
                varType: targetMemberType,
                varKind: 'elementary',
                varByteSize: parseInt(targetMemberType.match(bytesRegex)[1], 10),
                varLine: targetMember.loc.start.line - 1,
              });
              return;
            }
            
            if (targetMemberType === 'string') {
              structResult.push({
                varName: targetMember.name,
                varType: targetMemberType,
                varKind: 'elementary', // it's really a dynamic array
                varByteSize: 32,
                varLine: targetMember.loc.start.line - 1,
              });
              return;  
            }
            
            if (targetMemberType === 'bool') {
              structResult.push({
                varName: targetMember.name,
                varType: targetMemberType,
                varKind: 'elementary', // it's really a dynamic array
                varByteSize: 1,
                varLine: targetMember.loc.start.line - 1,
              });
              return;  
            }
            
            if (targetMemberType === 'address') {
              structResult.push({
                varName: targetMember.name,
                varType: targetMemberType,
                varKind: 'elementary',
                varByteSize: 20,
                varLine: targetMember.loc.start.line - 1,
              });
              return;  
            }
        }
      });
      results[targetStruct.name] = structResult;
    });
    
    Object.keys(results).forEach((structName) => {
      console.log(`struct ${structName} { // solidity file: ${unique_file_name}\n`);
      let slotCount = 1;
      let storageSlotByteCount = 0;
      results[structName].forEach((targetMember) => {
        if (targetMember.varByteSize + storageSlotByteCount > 32) {
          console.log('  //' + '-'.repeat(10) + ` end of slot ${slotCount} | bytes in: ${storageSlotByteCount} | bytes left: ${32 - storageSlotByteCount}\n`);
          storageSlotByteCount = targetMember.varByteSize;        
          slotCount += 1;
        } else {
          storageSlotByteCount += targetMember.varByteSize;
        }
        console.log(`  ${input.split('\n')[targetMember.varLine].replace(/\/\/.+/, '').trim()} // bytes: ${targetMember.varByteSize}`);
      });
      
      const optimizedSlotCount = calcStructStorageSlotCount(results[structName].sort((a, b) => a.varByteSize - b.varByteSize));
      summary_can_be_more_efficient[unique_file_name] = { [structName]: { current: slotCount, optimized: optimizedSlotCount } };
      console.log('  //' + '-'.repeat(10) + ` end of slot ${slotCount} | bytes in: ${storageSlotByteCount} | bytes left: ${32 - storageSlotByteCount}`);
      console.log(`\n} // current slot count = ${slotCount} | optimized slot count = ${optimizedSlotCount}\n`);
    });
  });
  
  console.log('// STRUCTS THAT CAN BE OPTIMIZED');
  console.log('// =============================');
  let foundStructThatCanBeOptimized = false;
  Object.keys(summary_can_be_more_efficient).forEach((inputFilePath) => {
    Object.keys(summary_can_be_more_efficient[inputFilePath]).forEach((structName) => {
      if (summary_can_be_more_efficient[inputFilePath][structName].current > summary_can_be_more_efficient[inputFilePath][structName].optimized) {
        if (!foundStructThatCanBeOptimized) {
          foundStructThatCanBeOptimized = true;
        }
        console.log(`// file: ${inputFilePath}`);
        console.log(`// current num storage slots: ${summary_can_be_more_efficient[inputFilePath][structName].current}`);
        console.log(`// possible num storage slots: ${summary_can_be_more_efficient[inputFilePath][structName].optimized}`);
        console.log('// -----------------------------');
      }
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
