struct StructA { // file: Test14.sol | contract: A

  uint240 var1; // bytes: 30
  //---------- end of slot | bytes taken: 30 | bytes free: 2

  uint256 var2; // bytes: 32
  //---------- end of slot | bytes taken: 32 | bytes free: 0

  EnumMedium var3; // bytes: 2
  //---------- end of slot | bytes taken: 2 | bytes free: 30

} // slots that can be saved = 1

// STRUCTS THAT CAN BE OPTIMIZED
// =============================
// file: Test14.sol
// contract: A
// struct: StructA
// slots saved: 1
// -----------------------------
