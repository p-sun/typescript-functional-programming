import runLongestBranch_ForLoop from './src/FunctionalProgramming/2A_LongestBranch_ForLoop';
import runLongestBranch_Reduce from './src/FunctionalProgramming/2B_LongestBranch_Reduce';
import runLongestBranch_Lazy from './src/FunctionalProgramming/2C_LongestBranch_Lazy';
import runStreamExamples from './src/FunctionalProgramming/3B_Stream';
const Run = {
  // evaluatorTests: require('./src/MathEvaluator/EvaluatorTests'),
  // promises: require('./src/TypeScriptLanguage/3A_Promises'),
  // myPromisesTests: require('./src/TypeScriptLanguage/3B2_MyPromiseTests'),
  myPromisesAllTests: require('./src/TypeScriptLanguage/3C2_MyPromisesAllTests'),
  myPromisesAll2Tests: require('./src/TypeScriptLanguage/3D2_MyPromisesAll2Tests'),
  runLongestBranch_ForLoop: runLongestBranch_ForLoop,
  runLongestBranch_Reduce: runLongestBranch_Reduce,
  runLongestBranch_Lazy: runLongestBranch_Lazy,
  runStreamExamples: runStreamExamples,
};
Run.runLongestBranch_Lazy();

const rootElement = document.getElementById('root');
if (rootElement) {
  const para = document.createElement('h1');
  const node = document.createTextNode('TypeScript Math Evaluator');
  para.appendChild(node);
  rootElement.appendChild(para);
}
