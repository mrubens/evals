export class ComplexNumber {
  constructor(real, imag) {
    this._real = real;
    this._imag = imag;
  }

  get real() {
    return this._real;
  }

  get imag() {
    return this._imag;
  }

  add(other) {
    return new ComplexNumber(
      this._real + other.real,
      this._imag + other.imag
    );
  }

  sub(other) {
    return new ComplexNumber(
      this._real - other.real,
      this._imag - other.imag
    );
  }

  mul(other) {
    // (a + bi)(c + di) = (ac - bd) + (ad + bc)i
    const real = this._real * other.real - this._imag * other.imag;
    const imag = this._real * other.imag + this._imag * other.real;
    return new ComplexNumber(real, imag);
  }

  div(other) {
    // (a + bi) / (c + di) = [(a + bi)(c - di)] / (c² + d²)
    const denominator = other.real * other.real + other.imag * other.imag;
    const real = (this._real * other.real + this._imag * other.imag) / denominator;
    const imag = (this._imag * other.real - this._real * other.imag) / denominator;
    return new ComplexNumber(real, imag);
  }

  get abs() {
    // |a + bi| = √(a² + b²)
    return Math.sqrt(this._real * this._real + this._imag * this._imag);
  }

  get conj() {
    // conjugate of a + bi = a - bi
    return new ComplexNumber(this._real, -this._imag);
  }

  get exp() {
    // e^(a + bi) = e^a * (cos(b) + i*sin(b))
    const expReal = Math.exp(this._real);
    const real = expReal * Math.cos(this._imag);
    const imag = expReal * Math.sin(this._imag);
    return new ComplexNumber(real, imag);
  }
}
