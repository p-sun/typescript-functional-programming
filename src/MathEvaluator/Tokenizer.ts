import { Token } from './Term';

export class TextBuffer {
  offset = 0;

  constructor(private readonly contents: string) {}

  get(count: number = 1) {
    const start = this.offset;
    if (this.offset + count >= this.contents.length) {
      this.offset = this.contents.length;
    } else {
      this.offset += count;
    }
    return this.contents.slice(start, start + count);
  }

  unget(count: number = 1) {
    if (this.offset - count <= 0) {
      this.offset = 0;
    } else {
      this.offset -= count;
    }
  }
}

export default function tokenizer(contents: string): Token[] {
  return contents.split(' ');
}
