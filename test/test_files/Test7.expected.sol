struct StructA { // file: Test7.sol | contract: A

  bool var1; // bytes: 1
  uint16 var2; // bytes: 2
  //---------- end of slot | bytes taken: 3 | bytes free: 29

  bytes32 var3; // bytes: 32
  //---------- end of slot | bytes taken: 32 | bytes free: 0

  bytes32 var4; // bytes: 32
  //---------- end of slot | bytes taken: 32 | bytes free: 0

  string var5; // bytes: 32
  //---------- end of slot | bytes taken: 32 | bytes free: 0

  uint8 var6; // bytes: 1
  //---------- end of slot | bytes taken: 1 | bytes free: 31

} // slots that can be saved = 1

struct StructB { // file: Test7.sol | contract: A

  uint88 var1; // bytes: 11
  //---------- end of slot | bytes taken: 11 | bytes free: 21

  StructA var2; // bytes: 32
  //---------- end of slot | bytes taken: 32 | bytes free: 0

  uint88 var3; // bytes: 11
  //---------- end of slot | bytes taken: 11 | bytes free: 21

} // slots that can be saved = 1

// STRUCTS THAT CAN BE OPTIMIZED
// =============================
// file: Test7.sol
// contract: A
// struct: StructA
// slots saved: 1
// -----------------------------
// file: Test7.sol
// contract: A
// struct: StructB
// slots saved: 1
// -----------------------------
