# Release Process

## Versioning

Kairos follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version (x.0.0): Incompatible API changes
- **MINOR** version (0.x.0): Backwards-compatible functionality additions
- **PATCH** version (0.0.x): Backwards-compatible bug fixes

## Pre-release Checklist

Before creating a release, ensure all items are checked:

### Code Quality
- [ ] All tests pass (`npm test`)
- [ ] Test coverage is above 90% (`npm run test:coverage`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compilation successful (`npm run typecheck`)
- [ ] Bundle size is acceptable (`npm run size`)

### Security
- [ ] Security audit passes (`npm audit`)
- [ ] Custom security audit passes (`node tools/security-audit.js`)
- [ ] No sensitive data in code or commits
- [ ] Dependencies are up to date

### Documentation
- [ ] README is up to date
- [ ] API documentation is complete (`npm run docs:build`)
- [ ] CHANGELOG is updated
- [ ] Migration guide (if breaking changes)
- [ ] Examples are working

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Performance tests pass
- [ ] Cross-platform tests pass
- [ ] Browser tests pass (if applicable)

### Build
- [ ] Production build successful (`npm run build`)
- [ ] Browser build successful (`npm run build:browser`)
- [ ] All export formats work (ESM, CJS, UMD)
- [ ] Package.json version updated
- [ ] Package.json exports are correct

## Release Process

### 1. Prepare Release Branch

```bash
# Create release branch from main
git checkout main
git pull origin main
git checkout -b release/v1.0.0

# Update version in package.json
npm version 1.0.0 --no-git-tag-version

# Update CHANGELOG.md
# Add release notes for the new version

# Commit changes
git add .
git commit -m "chore: prepare release v1.0.0"
```

### 2. Final Testing

```bash
# Run all checks
npm run check

# Test package locally
npm pack
npm install oxog-kairos-1.0.0.tgz --no-save
# Test in a sample project
```

### 3. Create Pull Request

1. Push release branch: `git push origin release/v1.0.0`
2. Create PR from `release/v1.0.0` to `main`
3. Ensure all CI checks pass
4. Get code review approval
5. Merge PR

### 4. Create Release

#### Option A: GitHub Web Interface
1. Go to [Releases](https://github.com/ersinkoc/kairos/releases)
2. Click "Draft a new release"
3. Tag version: `v1.0.0`
4. Target: `main`
5. Release title: `Release v1.0.0`
6. Copy release notes from CHANGELOG
7. If pre-release, check "This is a pre-release"
8. Click "Publish release"

#### Option B: GitHub CLI
```bash
gh release create v1.0.0 \
  --title "Release v1.0.0" \
  --notes-file RELEASE_NOTES.md \
  --target main
```

#### Option C: Manual Workflow Trigger
1. Go to [Actions](https://github.com/ersinkoc/kairos/actions)
2. Select "Continuous Deployment" workflow
3. Click "Run workflow"
4. Enter version number
5. Select pre-release if applicable
6. Click "Run workflow"

### 5. Verify Release

After the CD pipeline completes:

- [ ] Package published to npm: https://www.npmjs.com/package/@oxog/kairos
- [ ] GitHub release created with artifacts
- [ ] Documentation deployed to GitHub Pages
- [ ] Install and test from npm: `npm install @oxog/kairos@1.0.0`

### 6. Post-Release

```bash
# Update main branch
git checkout main
git pull origin main

# Create post-release commit if needed
git commit --allow-empty -m "chore: post-release v1.0.0"
git push origin main

# Announce release (optional)
# - Twitter/X
# - Discord/Slack
# - Blog post
# - Reddit (r/javascript)
```

## Hotfix Process

For critical bugs in production:

```bash
# Create hotfix branch from tag
git checkout v1.0.0
git checkout -b hotfix/v1.0.1

# Make fixes
# ...

# Update version
npm version patch --no-git-tag-version

# Commit
git add .
git commit -m "fix: critical bug description"

# Create PR to main
# After merge, create release v1.0.1
```

## Pre-release Process

For beta/RC releases:

```bash
# Version with pre-release identifier
npm version 1.1.0-beta.1 --no-git-tag-version

# Publish with beta tag
npm publish --tag beta

# Users install with:
# npm install @oxog/kairos@beta
```

## Rollback Process

If a release has critical issues:

1. **Deprecate on npm** (cannot unpublish after 24 hours):
```bash
npm deprecate @oxog/kairos@1.0.0 "Critical bug, please use 1.0.1"
```

2. **Create hotfix release** immediately

3. **Update GitHub release** notes with warning

## Version Naming Convention

- Production: `1.0.0`
- Beta: `1.0.0-beta.1`
- Release Candidate: `1.0.0-rc.1`
- Alpha: `1.0.0-alpha.1`
- Next: `1.0.0-next.1`

## NPM Tags

- `latest`: Current stable release (default)
- `beta`: Beta releases
- `next`: Next major version preview
- `legacy`: Previous major version

## Troubleshooting

### NPM Publish Fails

1. Check authentication: `npm whoami`
2. Verify registry: `npm config get registry`
3. Check permissions: Must be owner/maintainer of @oxog/kairos
4. Try manual publish: `npm publish --access public`

### GitHub Actions Fails

1. Check secrets are configured:
   - `NPM_TOKEN`: npm automation token
   - `GITHUB_TOKEN`: Auto-provided by GitHub

2. Check branch protection rules don't block automation

3. Verify tag format matches pattern `v*`

### Documentation Deploy Fails

1. Ensure GitHub Pages is enabled in repository settings
2. Check CNAME record if using custom domain
3. Verify docs build locally: `npm run docs:build`

## Maintenance

### Regular Tasks

- **Weekly**: Check for dependency updates
- **Monthly**: Run full security audit
- **Quarterly**: Review and update documentation
- **Yearly**: Major version planning

### Deprecation Policy

1. Announce deprecation in minor version
2. Add console warnings for deprecated features
3. Remove in next major version
4. Maintain compatibility table in docs

## Contact

Release Manager: Ersin Koc (ersinkoc@gmail.com)

For urgent release issues, contact via:
- GitHub Issues
- Email
- Twitter/X: @ersinkoc