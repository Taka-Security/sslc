# **S**olidity **S**truct **L**ayout **C**hecker

![License](https://img.shields.io/github/license/rmi7/sslc.svg?style=flat-square)
[![Version](https://img.shields.io/npm/v/sslc.svg?style=flat-square&label=version)](https://www.npmjs.com/package/sslc)
![Download](https://img.shields.io/npm/dt/sslc.svg)

Given some Solidity smart contract(s), extract all structs and check if their members could be laid out more efficient (=occupy less storage slots).

## Dependencies

Makes use of [solidity-parser-antlr](https://github.com/federicobond/solidity-parser-antlr) to parse Solidity files.

## Usage

```
usage: sslc [-h] [-v] -f path [path ...] [-oj path] [-ot path]

Solidity struct layout checker

Optional arguments:
  -h, --help          Show this help message and exit.
  -v, --version       Show program's version number and exit.
  -f path [path ...]  input solidity file(s), supports glob
  -oj path            write output to JSON file
  -ot path            write output to text file
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

The script will print text output using Solidity syntax to stdout. 
It is also possible to save the text output to a file or save JSON output to a file.

#### Text output

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
 
} // slots that can be saved = 2

struct MyParentStruct { // file: SomeOtherContract.sol | contract: ParentContract

  uint8 myFirstVar; // bytes: 1
  //---------- end of slot 1 | bytes taken: 1 | bytes free: 31
  
  uint256 mySecondVar; // bytes: 32
  //---------- end of slot 2 | bytes taken: 32 | bytes free: 0
  
  uint16 myThirdVar; // bytes: 2
  //---------- end of slot 3 | bytes taken: 2 | bytes free: 30
  
} // slots that can be saved = 1

struct MyOtherStruct { // file: SomeOtherContract.sol | contract: SomeOtherContract

  uint256 myFirstVar; // bytes: 32
  //---------- end of slot 1 | bytes taken: 32 | bytes free: 0
  
  address mySecondVar; // bytes: 20
  //---------- end of slot 2 | bytes taken: 20 | bytes free: 12
 
} // slots that can be saved = 0

// STRUCTS THAT CAN BE OPTIMIZED
// =============================
// file: SomeContract.sol
// contract: SomeContract
// struct: MyFirstStruct
// slots saved: 2
// -----------------------------
// file: SomeOtherContract.sol
// contract: ParentContract
// struct: MyParentStruct
// slots saved: 1
// -----------------------------
```

#### JSON output

```json
[
    {
        "file": "SomeContract.sol",
        "contract": "SomeContract",
        "struct": "MyFirstStruct",
        "slotsSaved": 2
    },
    {
        "file": "SomeOtherContract.sol",
        "contract": "ParentContract",
        "struct": "MyParentStruct",
        "slotsSaved": 1
    }
]
```

## Test

`npm test`

## License

MIT
