This repository serves as a system for using GitHub Issues as a micro-notes platform, similar to a microblog or services like Flomo. It periodically processes these issues and exports their content into a JSON file, making them accessible for external applications or services.

# Git-Thoughts: Issues to JSON Sync

This repository automatically processes GitHub Issues labeled "Public" and generates a `public/issues.json` file. This allows you to use GitHub Issues as a lightweight CMS for micro-notes or blog posts, with the content made available in a structured JSON format.

## 🌟 Live Implementation

**See it in action**: [https://me.deeptoai.com/musings](https://me.deeptoai.com/musings)

This system powers a fully functional microblogging platform that:
- 📝 Displays GitHub Issues as elegant blog posts
- ✍️ Allows publishing new musings directly from the web interface  
- 🏷️ Supports tag-based filtering and organization
- 📱 Features responsive design with modern UI
- 🔄 Auto-syncs content via GitHub Actions

**Technical Implementation**: For detailed setup instructions and integration examples, see [Musings System Documentation](https://github.com/foreveryh/onur.dev.blog/blob/master/docs/MUSINGS_README.md)

---

## Quick Start

### Data Access
The generated JSON is available at:
```
https://raw.githubusercontent.com/foreveryh/git-thoughts/main/public/issues.json
```

### Basic Integration
```javascript
// Fetch musings data
const response = await fetch(
  'https://raw.githubusercontent.com/foreveryh/git-thoughts/main/public/issues.json'
);
const musings = await response.json();

// Each musing object contains:
// { id, number, title, body, url, created_at, updated_at, tags }
```

For complete Next.js integration with publishing capabilities, see the [technical documentation](https://github.com/foreveryh/onur.dev.blog/blob/master/docs/MUSINGS_README.md).

---

## How It Works

**Core Components:**
- 🔄 **GitHub Actions Workflow**: Automatically syncs Issues → JSON on schedule  
- 📝 **Node.js Script**: Fetches and processes public issues via GitHub API
- 🔒 **External Issue Filter**: Blocks non-owner submissions while preserving blog posts
- 📊 **Structured Export**: Clean JSON format optimized for frontend consumption

**Key Features:**
- ✅ Scheduled sync (daily) + manual trigger
- ✅ Smart filtering by "Public" label  
- ✅ Tag preservation (excluding "Public" label)
- ✅ Auto-generated titles and metadata
- ✅ Conflict-free operation with external repos

## Manual Sync

To trigger an immediate sync:
1. Go to **Actions** tab → **"Sync Public Issues to issues.json"**
2. Click **"Run workflow"** button
3. Updated `issues.json` will be committed automatically

---

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Blog/App      │◄──►│   GitHub API     │◄──►│  GitHub Issues  │
│                 │    │                  │    │                 │
│ - Fetch JSON    │    │ - Read issues    │    │ - Content store │
│ - Display posts │    │ - Create issues  │    │ - Public label  │  
│ - Publish UI    │    │ - Auto sync      │    │ - Tag system    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Raw JSON URL   │    │ GitHub Actions   │    │ External Filter │
│                 │    │                  │    │                 │
│ - Public access │    │ - Scheduled sync │    │ - Block others  │
│ - ISR friendly  │    │ - Auto commit    │    │ - Preserve blog │
│ - No auth req'd │    │ - Error handling │    │ - Auto close    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Example Workflow Run

![Workflow Run](workflow.png)