const Run = {
  // evaluatorTests: require('./src/MathEvaluator/EvaluatorTests'),
  // promises: require('./src/TypeScriptLanguage/3A_Promises'),
  myPromisesTests: require('./src/TypeScriptLanguage/3B2_MyPromiseTests'),
  // myPromisesAllTests: require('./src/TypeScriptLanguage/3C2_MyPromisesAllTests'),
  // myPromisesAll2Tests: require('./src/TypeScriptLanguage/3D2_MyPromisesAll2Tests'),
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const para = document.createElement('h1');
  const node = document.createTextNode('TypeScript Math Evaluator');
  para.appendChild(node);
  rootElement.appendChild(para);
}
