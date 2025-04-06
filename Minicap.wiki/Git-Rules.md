# Git Rules

## Branches

* `main`: Production-ready branch
  * Contains only fully tested code
  * Only Scrum Masters can merge from `dev` to `main`
  * Merges require 100% test coverage
  * No direct commits or PRs allowed
* `dev`: Development integration branch
  * All feature branches merge here first
  * Requires 3 reviewer approvals for PRs
  * Must pass CI/CD checks
* Feature branches
  * Created from `dev` for all development work
  * created from task issues
  * Merge back to `dev` via PR

## Creating a New Branch

All branches must be created from GitHub issues:

1. Navigate to your assigned issue in GitHub
2. Click the "Create a branch" button on the right side of the issue
3. The branch name will be automatically formatted as `feature/[issue-number]-description`
4. Use GitHub Desktop or your IDE's built-in Git tools to checkout the branch
5. Never create branches using the command line

**Important:** All branches must be created from `dev`. The GitHub UI will handle this automatically when creating branches from issues.

## Commit Messages

* All commits must start with a first line, which will be called the **commit title**
* The title must start with an action verb in present tense
* The title must contain the issue number for the related issue, if applicable
* The title should be under 50 characters (not necessary, but good practice)
* If you need to further explain details or reasoning behind your commit, include them in a body underneath the title. There must be an extra newline between the title and body of the commit

Example commit message:

```
Update README.md

The README had outdated information, so it was changed 
to reflect recent modifications to the code.
```

For further reading about good practices related to commit messages: https://chris.beams.io/posts/git-commit/

## Pull Request (PR) Process

### Making a PR

1. Go to the issue you were assigned and open the PR from there.
2. Base branch should be `dev` (unless you're a Scrum Master merging to `main`)
3. Set your PR description by using the repository's template.
4. Fix any merge conflicts
5. Requires 3 reviewer approvals before merging
6. Once merged issues will be closed automatically.

### Before Merging

* All acceptance criteria must be met
* Panel of Peers (Team Leads and Scrum Masters) conduct collaborative code reviews
* Anyone can add code reviews to PRs at any time
* Team Leads must present their team's PRs at the bi-weekly meetings

