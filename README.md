# sslc

**s**olidity **s**truct **l**ayout **c**hecker

![License](https://img.shields.io/github/license/rmi7/sslc.svg?style=flat-square)
[![Version](https://img.shields.io/npm/v/sslc.svg?style=flat-square&label=version)](https://www.npmjs.com/package/sslc)
![Download](https://img.shields.io/npm/dt/sslc.svg)

Given some Solidity smart contract(s), extract info about all structs. Ending with a list of structs which could be stored more efficiently by reordering the struct member variables.

## Dependencies

Makes use of [solidity-parser-antlr](https://github.com/federicobond/solidity-parser-antlr) to parse Solidity files.

## Usage

```
usage: sslc [-h] [-v] -f path [path ...] [--only-last]

Solidity struct layout checker

Optional arguments:
  -h, --help          Show this help message and exit.
  -v, --version       Show program's version number and exit.
  -f path [path ...]  input solidity file(s), supports glob
  --only-last         use only last contract in input file
```

#### without install

```
npx sslc -f ~/my-solidity-project/contracts/*.sol
```

#### with install

```
npm i -g sslc
sslc -f ~/my-solidity-project/contracts/*.sol
```

## Output

The output will be a single Solidity file printed to stdout. Example output:

```Solidity
struct MyFirstStruct { // file: SomeContract.sol | contract: SomeContract

  uint8 myFirstVar; // bytes: 1
  //---------- end of slot 1 | bytes taken: 1 | bytes free: 31
  
  bytes32[] mySecondVar; // bytes: 32
  //---------- end of slot 2 | bytes taken: 32 | bytes free: 0
  
  bool myThirdVar; // bytes: 1
  //---------- end of slot 3 | bytes taken: 1 | bytes free: 31
  
  uint256 myFourthVar; // bytes: 32
  //---------- end of slot 4 | bytes taken: 32 | bytes free: 0
  
  bool myFourthVar; // bytes: 1
  //---------- end of slot 5 | bytes taken: 1 | bytes free: 31
 
} // current slot count = 5 | optimized slot count = 3

struct MyParentStruct { // file: SomeOtherContract.sol | contract: ParentContract

  uint8 myFirstVar; // bytes: 1
  //---------- end of slot 1 | bytes taken: 1 | bytes free: 31
  
  uint256 mySecondVar; // bytes: 32
  //---------- end of slot 2 | bytes taken: 32 | bytes free: 0
  
  uint16 myThirdVar; // bytes: 2
  //---------- end of slot 3 | bytes taken: 2 | bytes free: 30
  
} // current slot count = 3 | optimized slot count = 2

struct MyOtherStruct { // file: SomeOtherContract.sol | contract: SomeOtherContract

  uint256 myFirstVar; // bytes: 32
  //---------- end of slot 1 | bytes taken: 32 | bytes free: 0
  
  address mySecondVar; // bytes: 20
  //---------- end of slot 2 | bytes taken: 20 | bytes free: 12
 
} // current slot count = 2 | optimized slot count = 2

// STRUCTS THAT CAN BE OPTIMIZED
// =============================
// file: SomeContract.sol
// contract: SomeContract
// struct: MyFirstStruct
// current num storage slots: 5
// possible num storage slots: 3
// -----------------------------
// file: SomeOtherContract.sol
// contract: ParentContract
// struct: MyParentStruct
// current num storage slots: 3
// possible num storage slots: 2
// -----------------------------
```

## Test

`npm test`

## License

MIT
