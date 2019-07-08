struct StructB_return_full { // file: Test10.sol | contract: A

  bytes12 var1; // bytes: 12
  uint160 var2; // bytes: 20
  //---------- end of slot | bytes taken: 32 | bytes free: 0

  uint88 var1; // bytes: 11
  //---------- end of slot | bytes taken: 11 | bytes free: 21

  bytes24 var4; // bytes: 24
  //---------- end of slot | bytes taken: 24 | bytes free: 8

  bytes15 var5; // bytes: 15
  //---------- end of slot | bytes taken: 15 | bytes free: 17

  bytes22 var6; // bytes: 22
  //---------- end of slot | bytes taken: 22 | bytes free: 10

  bytes19 var7; // bytes: 19
  //---------- end of slot | bytes taken: 19 | bytes free: 13

  bytes23 var8; // bytes: 23
  //---------- end of slot | bytes taken: 23 | bytes free: 9

  bytes16 var9; // bytes: 16
  //---------- end of slot | bytes taken: 16 | bytes free: 16

} // slots that can be saved = 2

// STRUCTS THAT CAN BE OPTIMIZED
// =============================
// file: Test10.sol
// contract: A
// struct: StructB_return_full
// slots saved: 2
// -----------------------------
