struct StructB_return_early { // file: Test11.sol | contract: A

  bytes12 var1; // bytes: 12
  uint160 var2; // bytes: 20
  //---------- end of slot | bytes taken: 32 | bytes free: 0

  uint88 var1; // bytes: 11
  //---------- end of slot | bytes taken: 11 | bytes free: 21

  bytes24 var4; // bytes: 24
  //---------- end of slot | bytes taken: 24 | bytes free: 8

  bytes10 var5; // bytes: 10
  bytes11 var6; // bytes: 11
  //---------- end of slot | bytes taken: 21 | bytes free: 11

} // slots that can be saved = 1

// STRUCTS THAT CAN BE OPTIMIZED
// =============================
// file: Test11.sol
// contract: A
// struct: StructB_return_early
// slots saved: 1
// -----------------------------
