export class Binary {
  constructor(binaryString) {
    this.binaryString = binaryString;
  }

  toDecimal() {
    // Check if the string contains only 0s and 1s
    if (!/^[01]+$/.test(this.binaryString)) {
      return null;
    }

    // Convert binary to decimal
    return parseInt(this.binaryString, 2);
  }
}
