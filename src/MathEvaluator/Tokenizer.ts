import { Token } from './Term';

export default function tokenizer(contents: string): Token[] {
  return contents.split(' ');
}
