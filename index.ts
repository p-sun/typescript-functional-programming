import runEvaluatorTests from './src/MathEvaluator/EvaluatorTests';
import runPromises from './src/TypeScriptLanguage/Promises';
import runMyPromisesTests from './src/TypeScriptLanguage/__tests/MyPromiseTests';

runMyPromisesTests();
// runPromises();
// runEvaluatorTests();

const rootElement = document.getElementById('root');
if (rootElement) {
  const para = document.createElement('h1');
  const node = document.createTextNode('TypeScript Math Evaluator');
  para.appendChild(node);
  rootElement.appendChild(para);
}
