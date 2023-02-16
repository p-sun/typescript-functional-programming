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

type Branch = { path: string; length: number };
const EmptyBranch: Branch = { path: '', length: 0 };

function longestBranch(node: FPTree): Branch {
  const helper = (acc: Branch, c: FPTree) => {
    const childBranch = longestBranch(c);
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

  console.log('longestBranch A: ', longestBranch(A)); // 3
  console.log('longestBranch B: ', longestBranch(B)); // 2
  console.log('longestBranch C: ', longestBranch(C)); // 1

  longestBranch(A);
}
