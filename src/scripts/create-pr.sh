#!/bin/bash

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install Git first."
    exit 1
fi

# Check if current directory is a git repository
if ! git rev-parse --is-inside-work-tree &> /dev/null; then
    echo "Current directory is not a git repository."
    exit 1
fi

# Create a new branch for the PR
BRANCH_NAME="feature/svg-processing-$(date +%Y%m%d)"
git checkout -b "$BRANCH_NAME"

# Add all changes
git add .

# Commit changes
git commit -m "Implement SVG floor plan processing

- Add Room and Building models
- Implement SVG processing service
- Add room search service
- Add comprehensive tests
- Update documentation"

# Push the branch
git push origin "$BRANCH_NAME"

echo "PR branch created and pushed successfully!"
echo "Branch name: $BRANCH_NAME"
echo "Please create a PR using the template at .github/pull_request_template.md" 