contract A {
  struct StructA {
    bytes32 var1;
    bytes32 var2;
    uint8 var3;
  }
  struct StructB {
    bytes32 var1;
    bytes32 var2;
    uint8 var3;
    StructA var4;
    uint8 var5;
  }
  struct StructC {
    bytes32 var1;
    bytes32 var2;
    uint8 var3;
    StructB var4;
    uint8 var5;
  }
}