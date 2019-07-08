struct StructA { // file: Test13.sol | contract: A

  uint248 var1; // bytes: 31
  //---------- end of slot | bytes taken: 31 | bytes free: 1

  uint256 var2; // bytes: 32
  //---------- end of slot | bytes taken: 32 | bytes free: 0

  EnumSmall var3; // bytes: 1
  //---------- end of slot | bytes taken: 1 | bytes free: 31

} // slots that can be saved = 1

// STRUCTS THAT CAN BE OPTIMIZED
// =============================
// file: Test13.sol
// contract: A
// struct: StructA
// slots saved: 1
// -----------------------------
