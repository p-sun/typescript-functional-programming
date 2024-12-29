import runStack from './src/FunctionalProgramming/2A_DS_Stack';
import runLongestBranch_ForLoop from './src/FunctionalProgramming/2B_DS_Tree_LongestBranch_ForLoop';
import runLongestBranch_Reduce from './src/FunctionalProgramming/2C_DS_Tree_LongestBranch_Reduce';
import runLongestBranch_Lazy from './src/FunctionalProgramming/2D_DS_Tree_LongestBranch_Lazy';
import runStream from './src/FunctionalProgramming/3B_Stream';
import runOptionalMonad from './src/FunctionalProgramming/4A_OptionalMonad';
import runStackMonad from './src/FunctionalProgramming/4B_StackMonad';
import runStateMonad from './src/FunctionalProgramming/4C_StateMonad';
import runStackInStateMonad from './src/FunctionalProgramming/4D_StackInStateMonad';
import runResultADT from './src/FunctionalProgramming/5A_ResultADT';
import runListADT from './src/FunctionalProgramming/5B_ListADT';
import runADTMatchers from './src/FunctionalProgramming/5C0_GenericADT_Full';
import runEvaluatorTests from './src/MathEvaluator/__tests/EvaluatorTests';
import runParserCombinatorYouTube from './src/ParserCombinator/OtherImplementations/ParserEpisode4';
import runParserCombinator from './src/ParserCombinator/ParserCombinator_v1';
import runParserTests from './src/ParserCombinator/V2FromScratch/ParserCombinator_v2.9'

// import runParser from './src/Idris Language/2024_12_5_4_HW'
const Run = {
  Promises: {
    // runPromises: require('./src/Promises/B2_MyPromiseTests'),
    // myPromisesTests: require('./src/Promises/B2_MyPromiseTests'),
    // runMyPromisesAll: require('./src/Promises/C2_MyPromisesAllTests'),
    // myPromisesAll2Tests: require('./src/Promises/D2_MyPromisesAll2Tests'),
  },
  JSLanguage: {
    // runThisCallApplyBind: require('./src/TypeScriptLanguage/4_JS_ThisBindApplyCall'),
    runResultADT: runResultADT,
    runListADT: runListADT,
    runGenericADTMatcher: runADTMatchers,
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
  FPBasics: {
    // Currying: require('./src/FunctionalProgramming/1B_Currying'),
    runOptionalMonad: runOptionalMonad,
    runStateMonad: runStateMonad,
    runStackMonad: runStackMonad,
    runStackInStateMonad: runStackInStateMonad,
  },
  ParserCombinator: {
    runParserCombinator: runParserCombinator, // One that I wrote in TS
    runParserCombinatorYouTube: runParserCombinatorYouTube, // From YouTube, JS
  },
  MathEvaluator: {
    // Use Parser Combinator to tokenzie and evaluate math expressions from string
    runEvaluatorTests: runEvaluatorTests,
  },
};

// Run.FPBasics.runStackInStateMonad();
// Run.FPBasics.runStackMonad();
// Run.FPDataStructures.runStream();
// Run.JSLanguage.runGenericADTMatcher();
// Run.JSLanguage.runThisCallApplyBind();

const rootElement = document.getElementById('root');
if (rootElement) {
  const para = document.createElement('h1');
  const node = document.createTextNode('TypeScript Functional Programming');
  para.appendChild(node);
  rootElement.appendChild(para);
}

// runParser()
runParserTests()