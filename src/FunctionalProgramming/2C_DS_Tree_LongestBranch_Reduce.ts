/* -------------------------------------------------------------------------- */
/*                       Longest Branch - Easiest FP Way                      */
/* -------------------------------------------------------------------------- */

type FPTree = {
  id: string;
  children: FPTree[];
};

function longestBranchLength(node: FPTree): number {
  return (
    1 +
    node.children.reduce(
      (maxLength, c) => Math.max(longestBranchLength(c), maxLength),
      0
    )
  );
}

/* -------------------------------------------------------------------------- */
/*        Longest Branch - Easiest FP Way, also accumulating Branch name      */
/* -------------------------------------------------------------------------- */

const EmptyBranch = { path: '', length: 0 };
type Branch = typeof EmptyBranch;

// Easier to understand because map and reduce are separate steps.
// May use more heap memory because it creates an array of Branches after map.
function longestBranch_1(node: FPTree): Branch {
  const maxBranch = (acc: Branch, childBranch: Branch) => {
    return childBranch.length > acc.length ? childBranch : acc;
  };
  const longestChildBranch = node.children
    .map(longestBranch_1)
    .reduce(maxBranch, EmptyBranch);
  return {
    length: 1 + longestChildBranch.length,
    path: node.id + longestChildBranch.path,
  };
}

// Can also combine map and reduce into a single reduce.
// May use more stack memory because it needs the extra helper function.
function longestBranch_2(node: FPTree): Branch {
  const helper = (acc: Branch, c: FPTree) => {
    const childBranch = longestBranch_2(c);
    return childBranch.length > acc.length ? childBranch : acc;
  };
  const longestChildBranch: Branch = node.children.reduce(helper, EmptyBranch);
  return {
    length: 1 + longestChildBranch.length,
    path: node.id + longestChildBranch.path,
  };
}

/* -------------------------------------------------------------------------- */
/*                                  Examples                                  */
/* -------------------------------------------------------------------------- */

export default function run() {
  // A --> B --> C
  // l___________^
  const C: FPTree = { id: 'C', children: [] };
  const B: FPTree = { id: 'B', children: [C] };
  const A: FPTree = { id: 'A', children: [B, C] };

  console.log('longestBranchLength A: ', longestBranchLength(A)); // 3
  console.log('longestBranchLength B: ', longestBranchLength(B)); // 2
  console.log('longestBranchLength C: ', longestBranchLength(C)); // 1

  console.log('longestBranch A: ', longestBranch_2(A)); // 3
  console.log('longestBranch B: ', longestBranch_2(B)); // 2
  console.log('longestBranch C: ', longestBranch_2(C)); // 1

  console.log('longestBranch 2 A: ', longestBranch_1(A)); // 3
  console.log('longestBranch 2 B: ', longestBranch_1(B)); // 2
  console.log('longestBranch 2 C: ', longestBranch_1(C)); // 1
}
