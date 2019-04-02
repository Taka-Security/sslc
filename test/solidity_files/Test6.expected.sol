struct StructA { // file: Test6.sol | contract: A

  bool var1; // bytes: 1
  //---------- end of slot 1 | bytes taken: 1 | bytes free: 31

} // current slot count = 1 | optimized slot count = 1

struct StructB { // file: Test6.sol | contract: A

  uint8 var1; // bytes: 1
  //---------- end of slot 1 | bytes taken: 1 | bytes free: 31

  StructA var2; // bytes: 32
  //---------- end of slot 2 | bytes taken: 32 | bytes free: 0

} // current slot count = 2 | optimized slot count = 2

// STRUCTS THAT CAN BE OPTIMIZED
// =============================
// All structs seem to be efficiently laid out in memory
