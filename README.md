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
struct MyFirstStruct { // solidity file: SomeContract.sol

  uint256 myFirstVar; // bytes: 256
  //---------- end of slot 1 | bytes in: 32 | bytes left: 0
  
  address mySecondVar; // bytes: 20
  //---------- end of slot 2 | bytes in: 20 | bytes left: 12
 
} // current slot count = 2 | optimized slot count = 2

struct MySecondStruct { // solidity file: SomeContract.sol

  uint8 myFirstVar; // bytes: 1
  //---------- end of slot 1 | bytes in: 1 | bytes left: 31
  
  uint256 mySecondVar; // bytes: 32
  //---------- end of slot 2 | bytes in: 32 | bytes left: 0
  
  uint16 myThirdVar; // bytes: 2
  //---------- end of slot 3 | bytes in: 2 | bytes left: 30
  
} // current slot count = 3 | optimized slot count = 2

// STRUCTS THAT CAN BE OPTIMIZED
// =============================
// file: SomeContract.sol
// current num storage slots: 3
// possible num storage slots: 2
// -----------------------------
```

## TODO

### Optimize memory layout algorithm

The current algorithm to calculate the most efficient memory layout simply checks all permutations of the struct members, i.e. brute forcing. There are ways to optimize this and not check every single permutations, e.g. if two members are uint256, there is no need to check the case where these two members are in mirrored positions.

## License

MIT
