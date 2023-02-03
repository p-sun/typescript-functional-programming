import runEvaluatorTests from './src/MathEvaluator/EvaluatorTests';

runEvaluatorTests();

const rootElement = document.getElementById('root');
if (rootElement) {
  const para = document.createElement('h1');
  const node = document.createTextNode('TypeScript Math Evaluator');
  para.appendChild(node);
  rootElement.appendChild(para);
}
