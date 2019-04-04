struct StructA { // file: Test9.sol | contract: A

  bytes32 var1; // bytes: 32
  //---------- end of slot 1 | bytes taken: 32 | bytes free: 0

  bytes32 var2; // bytes: 32
  //---------- end of slot 2 | bytes taken: 32 | bytes free: 0

} // current slot count = 2 | optimized slot count = 2

// STRUCTS THAT CAN BE OPTIMIZED
// =============================
// All structs seem to be efficiently laid out in memory
