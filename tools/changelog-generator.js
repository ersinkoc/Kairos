#!/usr/bin/env node

/**
 * Kairos Changelog Generator
 * Automatically generates changelog entries from git commits and PR information
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ChangelogGenerator {
  constructor() {
    this.changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    this.packagePath = path.join(process.cwd(), 'package.json');
    this.conventionalCommitTypes = {
      feat: 'Added',
      fix: 'Fixed',
      docs: 'Documentation',
      style: 'Changed',
      refactor: 'Changed',
      test: 'Testing',
      chore: 'Maintenance',
      perf: 'Performance',
      build: 'Build',
      ci: 'CI/CD',
      revert: 'Reverted'
    };
  }

  async generateChangelog(options = {}) {
    const {
      version = null,
      fromTag = null,
      toTag = 'HEAD',
      dryRun = false,
      type = 'release' // 'release' or 'unreleased'
    } = options;

    console.log('📝 Generating changelog...\n');

    try {
      // Get current version if not provided
      const currentVersion = version || this.getCurrentVersion();
      
      // Get commit range
      const commitRange = this.getCommitRange(fromTag, toTag);
      console.log(`Analyzing commits from ${commitRange}`);

      // Parse commits
      const commits = this.parseCommits(commitRange);
      console.log(`Found ${commits.length} commits`);

      // Categorize changes
      const changes = this.categorizeChanges(commits);

      // Generate changelog entry
      const changelogEntry = this.generateChangelogEntry(currentVersion, changes, type);

      if (dryRun) {
        console.log('\n📋 Dry run - Generated changelog entry:');
        console.log(changelogEntry);
      } else {
        // Update changelog file
        this.updateChangelogFile(changelogEntry, type);
        console.log(`\n✅ Changelog updated for version ${currentVersion}`);
      }

      return changelogEntry;
    } catch (error) {
      console.error('❌ Error generating changelog:', error.message);
      process.exit(1);
    }
  }

  getCurrentVersion() {
    try {
      const packageJson = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
      return packageJson.version;
    } catch (error) {
      throw new Error('Could not read package.json version');
    }
  }

  getCommitRange(fromTag, toTag) {
    if (fromTag) {
      return `${fromTag}...${toTag}`;
    }

    // Try to get the latest tag
    try {
      const latestTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
      return `${latestTag}...${toTag}`;
    } catch (error) {
      // If no tags exist, use all commits
      return toTag;
    }
  }

  parseCommits(commitRange) {
    try {
      const gitLog = execSync(
        `git log ${commitRange} --pretty=format:"%H|%s|%an|%ad|%b" --date=short`,
        { encoding: 'utf8' }
      );

      if (!gitLog.trim()) {
        return [];
      }

      return gitLog.split('\n').filter(line => line.trim()).map(line => {
        const [hash, subject, author, date, body] = line.split('|');
        return {
          hash,
          subject: subject || '',
          author,
          date,
          body: body || '',
          type: this.getCommitType(subject || ''),
          scope: this.getCommitScope(subject || ''),
          description: this.getCommitDescription(subject || ''),
          breaking: this.isBreakingChange(subject || '', body || ''),
          closes: this.getClosedIssues(subject || '', body || '')
        };
      });
    } catch (error) {
      throw new Error(`Could not parse git commits: ${error.message}`);
    }
  }

  getCommitType(subject) {
    const match = subject.match(/^(\w+)(\(.+\))?\s*:\s*(.+)$/);
    if (match) {
      return match[1];
    }
    return 'other';
  }

  getCommitScope(subject) {
    const match = subject.match(/^(\w+)\((.+)\)\s*:\s*(.+)$/);
    if (match) {
      return match[2];
    }
    return null;
  }

  getCommitDescription(subject) {
    const match = subject.match(/^(\w+)(\(.+\))?\s*:\s*(.+)$/);
    if (match) {
      return match[3];
    }
    return subject;
  }

  isBreakingChange(subject, body) {
    return subject.includes('!') || body.includes('BREAKING CHANGE');
  }

  getClosedIssues(subject, body) {
    const combined = `${subject} ${body}`;
    const matches = combined.match(/(?:closes?|fixes?|resolves?)\s+#(\d+)/gi);
    if (matches) {
      return matches.map(match => match.match(/#(\d+)/)[1]);
    }
    return [];
  }

  categorizeChanges(commits) {
    const changes = {
      breaking: [],
      added: [],
      changed: [],
      deprecated: [],
      removed: [],
      fixed: [],
      security: [],
      other: []
    };

    commits.forEach(commit => {
      const category = this.getChangeCategory(commit);
      
      if (commit.breaking) {
        changes.breaking.push(commit);
      } else {
        changes[category].push(commit);
      }
    });

    return changes;
  }

  getChangeCategory(commit) {
    const typeMap = {
      feat: 'added',
      fix: 'fixed',
      docs: 'other',
      style: 'other',
      refactor: 'changed',
      test: 'other',
      chore: 'other',
      perf: 'changed',
      build: 'other',
      ci: 'other',
      revert: 'changed',
      security: 'security',
      remove: 'removed',
      deprecate: 'deprecated'
    };

    return typeMap[commit.type] || 'other';
  }

  generateChangelogEntry(version, changes, type) {
    const date = new Date().toISOString().split('T')[0];
    const isUnreleased = type === 'unreleased';
    
    let entry = '';
    
    if (isUnreleased) {
      entry += `## [Unreleased]\n\n`;
    } else {
      entry += `## [${version}] - ${date}\n\n`;
    }

    // Breaking changes first
    if (changes.breaking.length > 0) {
      entry += '### ⚠️ BREAKING CHANGES\n\n';
      changes.breaking.forEach(commit => {
        entry += `- ${commit.description}`;
        if (commit.scope) {
          entry += ` (${commit.scope})`;
        }
        entry += '\n';
      });
      entry += '\n';
    }

    // Added features
    if (changes.added.length > 0) {
      entry += '### Added\n\n';
      changes.added.forEach(commit => {
        entry += `- ${commit.description}`;
        if (commit.scope) {
          entry += ` (${commit.scope})`;
        }
        if (commit.closes.length > 0) {
          entry += ` (${commit.closes.map(issue => `#${issue}`).join(', ')})`;
        }
        entry += '\n';
      });
      entry += '\n';
    }

    // Changed features
    if (changes.changed.length > 0) {
      entry += '### Changed\n\n';
      changes.changed.forEach(commit => {
        entry += `- ${commit.description}`;
        if (commit.scope) {
          entry += ` (${commit.scope})`;
        }
        if (commit.closes.length > 0) {
          entry += ` (${commit.closes.map(issue => `#${issue}`).join(', ')})`;
        }
        entry += '\n';
      });
      entry += '\n';
    }

    // Deprecated features
    if (changes.deprecated.length > 0) {
      entry += '### Deprecated\n\n';
      changes.deprecated.forEach(commit => {
        entry += `- ${commit.description}`;
        if (commit.scope) {
          entry += ` (${commit.scope})`;
        }
        entry += '\n';
      });
      entry += '\n';
    }

    // Removed features
    if (changes.removed.length > 0) {
      entry += '### Removed\n\n';
      changes.removed.forEach(commit => {
        entry += `- ${commit.description}`;
        if (commit.scope) {
          entry += ` (${commit.scope})`;
        }
        entry += '\n';
      });
      entry += '\n';
    }

    // Fixed issues
    if (changes.fixed.length > 0) {
      entry += '### Fixed\n\n';
      changes.fixed.forEach(commit => {
        entry += `- ${commit.description}`;
        if (commit.scope) {
          entry += ` (${commit.scope})`;
        }
        if (commit.closes.length > 0) {
          entry += ` (${commit.closes.map(issue => `#${issue}`).join(', ')})`;
        }
        entry += '\n';
      });
      entry += '\n';
    }

    // Security fixes
    if (changes.security.length > 0) {
      entry += '### Security\n\n';
      changes.security.forEach(commit => {
        entry += `- ${commit.description}`;
        if (commit.scope) {
          entry += ` (${commit.scope})`;
        }
        entry += '\n';
      });
      entry += '\n';
    }

    return entry;
  }

  updateChangelogFile(newEntry, type) {
    let changelog = '';
    
    if (fs.existsSync(this.changelogPath)) {
      changelog = fs.readFileSync(this.changelogPath, 'utf8');
    } else {
      changelog = this.getChangelogTemplate();
    }

    if (type === 'unreleased') {
      // Update unreleased section
      const unreleasedRegex = /## \[Unreleased\]\s*\n\n/;
      if (unreleasedRegex.test(changelog)) {
        changelog = changelog.replace(unreleasedRegex, newEntry);
      } else {
        // Add unreleased section after the header
        const headerEnd = changelog.indexOf('\n\n') + 2;
        changelog = changelog.slice(0, headerEnd) + newEntry + '\n' + changelog.slice(headerEnd);
      }
    } else {
      // Add new release section
      const unreleasedEnd = changelog.indexOf('\n## [');
      if (unreleasedEnd !== -1) {
        changelog = changelog.slice(0, unreleasedEnd) + '\n' + newEntry + changelog.slice(unreleasedEnd);
      } else {
        // Add after the header
        const headerEnd = changelog.indexOf('\n\n') + 2;
        changelog = changelog.slice(0, headerEnd) + newEntry + '\n' + changelog.slice(headerEnd);
      }
    }

    fs.writeFileSync(this.changelogPath, changelog);
  }

  getChangelogTemplate() {
    return `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

`;
  }

  async generateReleaseNotes(version, changes) {
    const releaseNotes = [];
    
    releaseNotes.push(`# Release ${version}`);
    releaseNotes.push('');
    
    if (changes.breaking.length > 0) {
      releaseNotes.push('## ⚠️ Breaking Changes');
      releaseNotes.push('');
      changes.breaking.forEach(commit => {
        releaseNotes.push(`- ${commit.description}`);
      });
      releaseNotes.push('');
    }
    
    if (changes.added.length > 0) {
      releaseNotes.push('## 🚀 New Features');
      releaseNotes.push('');
      changes.added.forEach(commit => {
        releaseNotes.push(`- ${commit.description}`);
      });
      releaseNotes.push('');
    }
    
    if (changes.fixed.length > 0) {
      releaseNotes.push('## 🐛 Bug Fixes');
      releaseNotes.push('');
      changes.fixed.forEach(commit => {
        releaseNotes.push(`- ${commit.description}`);
      });
      releaseNotes.push('');
    }
    
    if (changes.changed.length > 0) {
      releaseNotes.push('## 🔄 Changes');
      releaseNotes.push('');
      changes.changed.forEach(commit => {
        releaseNotes.push(`- ${commit.description}`);
      });
      releaseNotes.push('');
    }
    
    const releaseNotesPath = path.join(process.cwd(), `RELEASE_NOTES_${version}.md`);
    fs.writeFileSync(releaseNotesPath, releaseNotes.join('\n'));
    
    console.log(`📄 Release notes generated: ${releaseNotesPath}`);
    return releaseNotesPath;
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
      case 'generate':
        await this.generateChangelog({
          version: args[1],
          fromTag: args[2],
          toTag: args[3] || 'HEAD',
          type: 'release'
        });
        break;
        
      case 'unreleased':
        await this.generateChangelog({
          type: 'unreleased'
        });
        break;
        
      case 'dry-run':
        await this.generateChangelog({
          version: args[1],
          fromTag: args[2],
          toTag: args[3] || 'HEAD',
          dryRun: true
        });
        break;
        
      case 'release-notes':
        const version = args[1];
        if (!version) {
          console.error('❌ Version is required for release notes');
          process.exit(1);
        }
        
        const commitRange = this.getCommitRange(args[2], args[3] || 'HEAD');
        const commits = this.parseCommits(commitRange);
        const changes = this.categorizeChanges(commits);
        
        await this.generateReleaseNotes(version, changes);
        break;
        
      default:
        console.log('Kairos Changelog Generator\n');
        console.log('Usage:');
        console.log('  node changelog-generator.js generate [version] [from-tag] [to-tag]');
        console.log('  node changelog-generator.js unreleased');
        console.log('  node changelog-generator.js dry-run [version] [from-tag] [to-tag]');
        console.log('  node changelog-generator.js release-notes <version> [from-tag] [to-tag]');
        console.log('');
        console.log('Examples:');
        console.log('  node changelog-generator.js generate 1.0.0');
        console.log('  node changelog-generator.js generate 1.1.0 v1.0.0 HEAD');
        console.log('  node changelog-generator.js unreleased');
        console.log('  node changelog-generator.js dry-run 1.0.0');
        console.log('  node changelog-generator.js release-notes 1.0.0');
        break;
    }
  }
}

// Run the changelog generator
const generator = new ChangelogGenerator();
generator.run().catch(console.error);