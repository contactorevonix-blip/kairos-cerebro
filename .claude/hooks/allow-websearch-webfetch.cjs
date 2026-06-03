#!/usr/bin/env node
// Auto-approve WebSearch and WebFetch for all contexts (main + subagents)
// Bypass for Claude Code bug #46250: allow rules unreliable in subagent contexts

'use strict';

let data = '';
process.stdin.on('data', chunk => { data += chunk; });
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data || '{}');
    const toolName = input.tool_name || '';
    if (toolName === 'WebSearch' || toolName === 'WebFetch') {
      process.stdout.write(JSON.stringify({ decision: 'approve' }));
    }
  } catch {
    // parse error → silent, default behavior
  }
  process.exit(0);
});
