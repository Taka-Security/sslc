struct StructA { // file: Test6.sol | contract: A

  bool var1; // bytes: 1
  //---------- end of slot 1 | bytes taken: 1 | bytes free: 31

} // slots that can be saved = 0

struct StructB { // file: Test6.sol | contract: A

  uint8 var1; // bytes: 1
  //---------- end of slot 1 | bytes taken: 1 | bytes free: 31

  StructA var2; // bytes: 32
  //---------- end of slot 2 | bytes taken: 32 | bytes free: 0

  address payable var3; // bytes: 20
  //---------- end of slot 3 | bytes taken: 20 | bytes free: 12

} // slots that can be saved = 1

// STRUCTS THAT CAN BE OPTIMIZED
// =============================
// file: Test6.sol
// contract: A
// struct: StructB
// slots saved: 1
// -----------------------------
