struct StructA { // file: Test5.sol | contract: A

  uint8 var1; // bytes: 1
  //---------- end of slot 1 | bytes taken: 1 | bytes free: 31

  uint var2; // bytes: 32
  //---------- end of slot 2 | bytes taken: 32 | bytes free: 0

  address var3; // bytes: 20
  //---------- end of slot 3 | bytes taken: 20 | bytes free: 12

} // current slot count = 3 | optimized slot count = 2

// STRUCTS THAT CAN BE OPTIMIZED
// =============================
// file: Test5.sol
// contract: A
// struct: StructA
// current num storage slots: 3
// possible num storage slots: 2
// -----------------------------
