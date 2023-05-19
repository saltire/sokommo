export default class Queue<T = any> {
  private stackIn: T[] = [];
  private stackOut: T[] = [];

  push(item: T) {
    this.stackIn.push(item);
  }

  shift() {
    if (!this.stackOut.length) {
      const tmp = this.stackOut;
      this.stackOut = this.stackIn.reverse();
      this.stackIn = tmp;
    }
    return this.stackOut.pop();
  }

  get length() {
    return this.stackIn.length + this.stackOut.length;
  }
}
