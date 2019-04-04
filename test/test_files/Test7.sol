contract A {
  struct StructA {
    bool var1;
    uint16 var2;
    bytes32 var3;
    bytes32 var4;
    string var5;
    uint8 var6;
  }
  struct StructB {
    uint88 var1;
    StructA var2;
    uint88 var3;
  }
}