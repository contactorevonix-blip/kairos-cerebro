const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { runCli } = require('../packages/kairos-cli');

function makeTempProject() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kairos-cli-'));
  fs.mkdirSync(path.join(root, 'docs', 'stories'), { recursive: true });
  return root;
}

function readStory(projectRoot, storyId) {
  return fs.readFileSync(path.join(projectRoot, 'docs', 'stories', `story-${storyId}.md`), 'utf8');
}

async function runInProject(projectRoot, fn) {
  const previous = process.cwd();
  process.chdir(projectRoot);
  try {
    return await fn();
  } finally {
    process.chdir(previous);
  }
}

test('init-story creates a new story scaffold', async () => {
  const projectRoot = makeTempProject();
  const logs = [];
  const errors = [];

  const code = await runInProject(projectRoot, async () =>
    runCli(
      ['node', 'kairos', 'init-story', '1.2.3', '--title', 'My First Story'],
      { log: (msg) => logs.push(msg), error: (msg) => errors.push(msg) }
    )
  );

  assert.equal(code, 0);
  assert.equal(errors.length, 0);
  const content = readStory(projectRoot, '1.2.3');
  assert.match(content, /# Story 1\.2\.3: My First Story/);
  assert.equal(logs.length, 1);
});

test('init-story rejects invalid id format', async () => {
  const logs = [];
  const errors = [];
  const code = await runCli(
    ['node', 'kairos', 'init-story', 'abc'],
    { log: (msg) => logs.push(msg), error: (msg) => errors.push(msg) }
  );

  assert.equal(code, 1);
  assert.equal(logs.length, 0);
  assert.match(errors[0], /Invalid story id/);
});

test('init-story prevents overwrite without force', async () => {
  const projectRoot = makeTempProject();
  const io = { log: () => {}, error: () => {} };

  const first = await runInProject(projectRoot, async () => runCli(['node', 'kairos', 'init-story', '3.1.4'], io));
  const secondErrors = [];
  const second = await runInProject(projectRoot, async () =>
    runCli(
      ['node', 'kairos', 'init-story', '3.1.4'],
      { log: () => {}, error: (msg) => secondErrors.push(msg) }
    )
  );

  assert.equal(first, 0);
  assert.equal(second, 1);
  assert.match(secondErrors[0], /already exists/);
});

test('init-story supports force overwrite', async () => {
  const projectRoot = makeTempProject();
  const io = { log: () => {}, error: () => {} };

  assert.equal(
    await runInProject(projectRoot, async () => runCli(['node', 'kairos', 'init-story', '5.5.5', '--title', 'Old'], io)),
    0
  );
  assert.equal(
    await runInProject(projectRoot, async () =>
      runCli(['node', 'kairos', 'init-story', '5.5.5', '--title', 'New', '--force'], io)
    ),
    0
  );

  const content = readStory(projectRoot, '5.5.5');
  assert.match(content, /# Story 5\.5\.5: New/);
});

test('validate-story passes for a scaffolded story', async () => {
  const projectRoot = makeTempProject();
  const logs = [];
  const errors = [];

  assert.equal(
    await runInProject(projectRoot, async () => runCli(['node', 'kairos', 'init-story', '7.7.7'], { log: () => {}, error: () => {} })),
    0
  );

  const code = await runInProject(projectRoot, async () =>
    runCli(['node', 'kairos', 'validate-story', '7.7.7'], {
      log: (msg) => logs.push(msg),
      error: (msg) => errors.push(msg),
    })
  );

  assert.equal(code, 0);
  assert.equal(errors.length, 0);
  assert.match(logs[0], /passed validation/i);
});

test('validate-story fails when file does not exist', async () => {
  const projectRoot = makeTempProject();
  const errors = [];

  const code = await runInProject(projectRoot, async () =>
    runCli(['node', 'kairos', 'validate-story', '9.9.9'], {
      log: () => {},
      error: (msg) => errors.push(msg),
    })
  );

  assert.equal(code, 1);
  assert.match(errors.join('\n'), /file not found/i);
});

test('validate-story fails when File List is empty', async () => {
  const projectRoot = makeTempProject();
  const storyPath = path.join(projectRoot, 'docs', 'stories', 'story-4.4.4.md');
  const brokenStory = `# Story 4.4.4: Broken

## Status

Draft

## Story

Broken story.

## Acceptance Criteria

- [ ] AC1

## Tasks / Subtasks

- [ ] Task

## Dev Agent Record

### File List

### Change Log
`;

  fs.writeFileSync(storyPath, brokenStory, 'utf8');
  const errors = [];

  const code = await runInProject(projectRoot, async () =>
    runCli(['node', 'kairos', 'validate-story', '4.4.4'], {
      log: () => {},
      error: (msg) => errors.push(msg),
    })
  );

  assert.equal(code, 1);
  assert.match(errors.join('\n'), /file list must contain at least one bullet entry/i);
});

test('verify:text fails fast without API key', async () => {
  const prev = process.env.KAIROS_API_KEY;
  delete process.env.KAIROS_API_KEY;
  const errors = [];
  const code = await runCli(
    ['node', 'kairos', 'verify:text', '--text', 'qualquer'],
    { log: () => {}, error: (m) => errors.push(m) }
  );
  if (prev !== undefined) process.env.KAIROS_API_KEY = prev;
  assert.equal(code, 1);
  assert.match(errors.join(' '), /api key|Missing API key/i);
});
