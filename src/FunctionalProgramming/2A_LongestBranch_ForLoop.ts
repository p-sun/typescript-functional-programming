type LongestBranch = { names: string; length: number };

class TreeNode {
  constructor(readonly name: string, readonly children: TreeNode[]) {}

  longestBranchLength() {
    if (this.children.length === 0) {
      return 1;
    }

    let maxLength = 0;
    for (let c of this.children) {
      maxLength = Math.max(c.longestBranchLength(), maxLength);
    }
    return 1 + maxLength;
  }

  longestBranch(): LongestBranch {
    if (this.children.length === 0) {
      return { names: this.name, length: 1 };
    }

    let longestBranch: LongestBranch = {
      names: '',
      length: 0,
    };
    for (let c of this.children) {
      const branch = c.longestBranch();
      if (branch.length > longestBranch.length) {
        longestBranch = branch;
      }
    }
    return {
      names: this.name + longestBranch.names,
      length: 1 + longestBranch.length,
    };
  }
}

export default function run() {
  // A --> B --> C
  // l___________^
  const C = new TreeNode('C', []);
  const B = new TreeNode('B', [C]);
  const A = new TreeNode('A', [B, C]);
  console.log('TREE', A.longestBranch());
}
