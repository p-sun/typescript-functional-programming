import runStack from './src/FunctionalProgramming/2A_DS_Stack';
import runLongestBranch_ForLoop from './src/FunctionalProgramming/2B_DS_Tree_LongestBranch_ForLoop';
import runLongestBranch_Reduce from './src/FunctionalProgramming/2C_DS_Tree_LongestBranch_Reduce';
import runLongestBranch_Lazy from './src/FunctionalProgramming/2D_DS_Tree_LongestBranch_Lazy';
import runStream from './src/FunctionalProgramming/3B_Stream';
import runEvaluatorTests from './src/MathEvaluator/__tests/EvaluatorTests';
import runParserCombinatorYouTube from './src/ParserCombinator/OtherImplementations/ParserEpisode4';
import runParserCombinator from './src/ParserCombinator/ParserCombinator';

const Run = {
  Promises: {
    // runPromises: require('./src/Promises/B2_MyPromiseTests'),
    // myPromisesTests: require('./src/Promises/B2_MyPromiseTests'),
    // runMyPromisesAll: require('./src/Promises/C2_MyPromisesAllTests'),
    // myPromisesAll2Tests: require('./src/Promises/D2_MyPromisesAll2Tests'),
  },
  FPDataStructures: {
    runStack: runStack,
    runStream: runStream,
    TreeLongestBranch: {
      runForLoop: runLongestBranch_ForLoop,
      runReduce: runLongestBranch_Reduce,
      runLazy: runLongestBranch_Lazy,
    },
  },
  ParserCombinator: {
    runParserCombinator: runParserCombinator, // One that I wrote in TS
    runParserCombinatorYouTube: runParserCombinatorYouTube, // From YouTube, JS
  },
  MathEvaluator: {
    // Use Parser Combinator to tokenzie and evaluate math expressions from string
    runEvaluatorTests: runEvaluatorTests,
  },
  FPBasics: {
    // Currying: require('./src/FunctionalProgramming/1B_Currying'),
  },
  JSLanguage: {
    runThisCallApplyBind: require('./src/TypeScriptLanguage/4_JS_ThisBindApplyCall'),
  },
};

// Run.FPDataStructures.runStack();
// Run.JSLanguage.runThisAndBind();

const rootElement = document.getElementById('root');
if (rootElement) {
  const para = document.createElement('h1');
  const node = document.createTextNode('TypeScript Functional Programming');
  para.appendChild(node);
  rootElement.appendChild(para);
}
