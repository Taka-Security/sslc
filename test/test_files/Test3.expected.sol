struct StructA { // file: Test3.sol | contract: A

  uint8 var1; // bytes: 1
  //---------- end of slot | bytes taken: 1 | bytes free: 31

  uint var2; // bytes: 32
  //---------- end of slot | bytes taken: 32 | bytes free: 0

  address var3; // bytes: 20
  //---------- end of slot | bytes taken: 20 | bytes free: 12

} // slots that can be saved = 1

struct StructB { // file: Test3.sol | contract: A

  bool var1; // bytes: 1
  //---------- end of slot | bytes taken: 1 | bytes free: 31

  uint var2; // bytes: 32
  //---------- end of slot | bytes taken: 32 | bytes free: 0

  bool var3; // bytes: 1
  //---------- end of slot | bytes taken: 1 | bytes free: 31

  uint var4; // bytes: 32
  //---------- end of slot | bytes taken: 32 | bytes free: 0

  bool var5; // bytes: 1
  //---------- end of slot | bytes taken: 1 | bytes free: 31

  bytes32 var6; // bytes: 32
  //---------- end of slot | bytes taken: 32 | bytes free: 0

  bool var7; // bytes: 1
  //---------- end of slot | bytes taken: 1 | bytes free: 31

} // slots that can be saved = 3

// STRUCTS THAT CAN BE OPTIMIZED
// =============================
// file: Test3.sol
// contract: A
// struct: StructA
// slots saved: 1
// -----------------------------
// file: Test3.sol
// contract: A
// struct: StructB
// slots saved: 3
// -----------------------------
