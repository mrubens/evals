export class Element {
  constructor(value, next = null) {
    this._value = value;
    this._next = next;
  }

  get value() {
    return this._value;
  }

  get next() {
    return this._next;
  }
}

export class List {
  constructor(values = []) {
    this._head = null;
    this._length = 0;

    // Add each value from the array
    values.forEach(value => {
      const element = new Element(value);
      this.add(element);
    });
  }

  add(element) {
    // Add element at the head (LIFO)
    element._next = this._head;
    this._head = element;
    this._length++;
  }

  get length() {
    return this._length;
  }

  get head() {
    return this._head;
  }

  toArray() {
    const result = [];
    let current = this._head;
    while (current !== null) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  reverse() {
    // Create a new list with values in reverse order
    const reversedList = new List();
    const values = this.toArray();
    
    // Add values in the order they appear (which reverses due to LIFO)
    values.forEach(value => {
      reversedList.add(new Element(value));
    });
    
    return reversedList;
  }
}
