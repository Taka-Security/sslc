struct StructA { // file: Test1.sol | contract: A

  uint var1; // bytes: 32
  //---------- end of slot | bytes taken: 32 | bytes free: 0

  address var2; // bytes: 20
  //---------- end of slot | bytes taken: 20 | bytes free: 12

} // slots that can be saved = 0

// STRUCTS THAT CAN BE OPTIMIZED
// =============================
// All structs seem to be efficiently laid out in memory
