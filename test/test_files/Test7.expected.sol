struct StructA { // file: Test7.sol | contract: A

  bool var1; // bytes: 1
  uint16 var2; // bytes: 2
  //---------- end of slot 1 | bytes taken: 3 | bytes free: 29

  bytes32 var3; // bytes: 32
  //---------- end of slot 2 | bytes taken: 32 | bytes free: 0

  bytes32 var4; // bytes: 32
  //---------- end of slot 3 | bytes taken: 32 | bytes free: 0

  string var5; // bytes: 32
  //---------- end of slot 4 | bytes taken: 32 | bytes free: 0

  uint8 var6; // bytes: 1
  //---------- end of slot 5 | bytes taken: 1 | bytes free: 31

} // current slot count = 5 | optimized slot count = 4

struct StructB { // file: Test7.sol | contract: A

  uint88 var1; // bytes: 11
  //---------- end of slot 1 | bytes taken: 11 | bytes free: 21

  StructA var2; // bytes: 128
  //---------- end of slot 2 | bytes taken: 32 | bytes free: 0
  //---------- end of slot 3 | bytes taken: 32 | bytes free: 0
  //---------- end of slot 4 | bytes taken: 32 | bytes free: 0
  //---------- end of slot 5 | bytes taken: 32 | bytes free: 0

  uint88 var3; // bytes: 11
  //---------- end of slot 6 | bytes taken: 11 | bytes free: 21

} // current slot count = 6 | optimized slot count = 5

// STRUCTS THAT CAN BE OPTIMIZED
// =============================
// file: Test7.sol
// contract: A
// struct: StructA
// current num storage slots: 5
// possible num storage slots: 4
// -----------------------------
// file: Test7.sol
// contract: A
// struct: StructB
// current num storage slots: 6
// possible num storage slots: 5
// -----------------------------
