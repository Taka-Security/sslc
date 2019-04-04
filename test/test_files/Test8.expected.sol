struct StructB { // file: Test8.sol | contract: A

  bytes12 var1; // bytes: 12
  uint160 var2; // bytes: 20
  //---------- end of slot 1 | bytes taken: 32 | bytes free: 0

  uint88 var1; // bytes: 11
  //---------- end of slot 2 | bytes taken: 11 | bytes free: 21

  bytes24 var4; // bytes: 24
  //---------- end of slot 3 | bytes taken: 24 | bytes free: 8

  bytes15 var5; // bytes: 15
  //---------- end of slot 4 | bytes taken: 15 | bytes free: 17

  bytes22 var6; // bytes: 22
  //---------- end of slot 5 | bytes taken: 22 | bytes free: 10

  bytes19 var7; // bytes: 19
  //---------- end of slot 6 | bytes taken: 19 | bytes free: 13

  bytes23 var8; // bytes: 23
  //---------- end of slot 7 | bytes taken: 23 | bytes free: 9

  bytes16 var9; // bytes: 16
  bytes15 var10; // bytes: 15
  //---------- end of slot 8 | bytes taken: 31 | bytes free: 1

  bytes17 var11; // bytes: 17
  //---------- end of slot 9 | bytes taken: 17 | bytes free: 15

  bytes21 var12; // bytes: 21
  uint8 var13; // bytes: 1
  uint64 var14; // bytes: 8
  //---------- end of slot 10 | bytes taken: 30 | bytes free: 2

  uint88 var15; // bytes: 11
  uint96 var16; // bytes: 12
  //---------- end of slot 11 | bytes taken: 23 | bytes free: 9

  uint96 var17; // bytes: 12
  bool var18; // bytes: 1
  bool var19; // bytes: 1
  //---------- end of slot 12 | bytes taken: 14 | bytes free: 18

} // slots that can be saved = 4

// STRUCTS THAT CAN BE OPTIMIZED
// =============================
// file: Test8.sol
// contract: A
// struct: StructB
// slots saved: 4
// -----------------------------
