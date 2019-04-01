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
// solidity file: /some/path/SomeContract.sol
struct Mystruct {

  uint8 myFirstVar; // bytes: 1
  //---------- end of slot 1 | bytes in: 1 | bytes left: 31
  
  uint256 mySecondVar; // bytes: 32
  //---------- end of slot 2 | bytes in: 32 | bytes left: 0
  
  uint16 myThirdVar; // bytes: 2
  //---------- end of slot 3 | bytes in: 2 | bytes left: 30
  
} // current slot count = 3 | optimized slot count = 2

// STRUCTS THAT CAN BE OPTIMIZED
// =============================
// file: /some/path/SomeContract.sol
// current num storage slots: 3
// possible num storage slots: 2
// -----------------------------
```

## TODO

### Optimized memory layout algorithm

The current algorithm to calculate the most efficient memory layout simply sorts all member variables based on byte size ascending, and checks how much storage slots this layout occupies. There is room for improvement here as this sometimes leads to not the most efficient layout. As shown in the following sample.

#### Actual file

```Solidity
struct MyStruct {
  uint32 var1; // bytes: 4
  uint88 var2; // bytes: 11
  uint88 var3; // bytes: 11
  //---------- end of slot 1 | bytes in: 26 | bytes left: 6

  uint88 var4; // bytes: 11
  uint88 var5; // bytes: 11
  uint64 var6; // bytes: 8
  //---------- end of slot 2 | bytes in: 30 | bytes left: 2
}
```

#### Assumed-to-be-most-efficient stuct member layout by current algorithm

```Solidity
struct MyStruct {
  uint32 var1; // bytes: 4
  uint64 var6; // bytes: 8
  uint88 var2; // bytes: 11
  //---------- end of slot 1 | bytes in: 23 | bytes left: 9
  
  uint88 var3; // bytes: 11
  uint88 var4; // bytes: 11
  //---------- end of slot 2 | bytes in: 22 | bytes left: 10

  uint88 var5; // bytes: 11
  //---------- end of slot 3 | bytes in: 11 | bytes left: 21
}
```

The current algorithm's most efficient layout takes one more storage slot than the actual struct layout.

## License

MIT
