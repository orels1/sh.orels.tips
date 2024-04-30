import { Octokit } from "octokit";

export async function commitFile({
  repo,
  owner,
  branch,
  path,
  content,
  message,
}: {
  repo: string;
  owner: string;
  branch: string;
  path: string;
  content: string;
  message: string;
}) {
  const client = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const existingBranch = await client.rest.repos.getBranch({
    repo,
    owner,
    branch,
  });

  const branchSHA = existingBranch.data.commit.sha;

  const tree = await client.rest.git.createTree({
    repo,
    owner,
    tree: [
      {
        path,
        mode: "100644",
        type: "blob",
        content,
      },
    ],
    base_tree: branchSHA,
  });

  const commit = await client.rest.git.createCommit({
    repo: "sh.orels.tips",
    owner: "orels1",
    message,
    tree: tree.data.sha,
    parents: branchSHA ? [branchSHA] : undefined,
  });

  await client.rest.git.updateRef({
    repo,
    owner,
    ref: `heads/${branch}`,
    sha: commit.data.sha,
  });
}
