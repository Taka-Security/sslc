struct StructB { // file: Test4.sol | contract: A

  bool var1; // bytes: 1
  //---------- end of slot 1 | bytes in: 1 | bytes left: 31

  uint var2; // bytes: 32
  //---------- end of slot 2 | bytes in: 32 | bytes left: 0

  bool var3; // bytes: 1
  //---------- end of slot 3 | bytes in: 1 | bytes left: 31

  uint var4; // bytes: 32
  //---------- end of slot 4 | bytes in: 32 | bytes left: 0

  bool var5; // bytes: 1
  //---------- end of slot 5 | bytes in: 1 | bytes left: 31

  bytes32 var6; // bytes: 32
  //---------- end of slot 6 | bytes in: 32 | bytes left: 0

  bool var7; // bytes: 1
  //---------- end of slot 7 | bytes in: 1 | bytes left: 31

} // current slot count = 7 | optimized slot count = 4

struct StructA { // file: Test4.sol | contract: A

  uint8 var1; // bytes: 1
  //---------- end of slot 1 | bytes in: 1 | bytes left: 31

  uint var2; // bytes: 32
  //---------- end of slot 2 | bytes in: 32 | bytes left: 0

  address var3; // bytes: 20
  //---------- end of slot 3 | bytes in: 20 | bytes left: 12

} // current slot count = 3 | optimized slot count = 2

struct StructA { // file: Test4.sol | contract: B

  uint8 var1; // bytes: 1
  //---------- end of slot 1 | bytes in: 1 | bytes left: 31

  bytes32 var2; // bytes: 32
  //---------- end of slot 2 | bytes in: 32 | bytes left: 0

  uint24 var3; // bytes: 3
  bytes17 var4; // bytes: 17
  //---------- end of slot 3 | bytes in: 20 | bytes left: 12

} // current slot count = 3 | optimized slot count = 2

// STRUCTS THAT CAN BE OPTIMIZED
// =============================
// file: Test4.sol
// contract: A
// struct: StructB
// current num storage slots: 7
// possible num storage slots: 4
// -----------------------------
// file: Test4.sol
// contract: A
// struct: StructA
// current num storage slots: 3
// possible num storage slots: 2
// -----------------------------
// file: Test4.sol
// contract: B
// struct: StructA
// current num storage slots: 3
// possible num storage slots: 2
// -----------------------------
