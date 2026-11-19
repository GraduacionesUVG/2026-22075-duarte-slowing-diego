## Workflow for developers

To develop a new feature or fix an error, follow the nex steps:

**1. Syncronize your local enviroment with QA:**
```bash
git checkout qa
git pull origin qa
```

**2. Create your branch:**
Use the prefix dev- followed by a brief description.

```bash
git checkout -b dev-my-new-function
```

**3. Develop and describe your commits:**
Use the Conventional Commits Convection: 

```bash
git add .
git commit -m "feat: add new feature"
```

**4. Upload your branch to GitHub:**

```bash
git push -u origin dev-my-new-function
```

**5. Create Pull Request (PR):**

Go to GitHub and open a PR from your dev branch to the qa branch. Let the automatic tests (GitHub Actions) pass successfully and ask for a review. 
