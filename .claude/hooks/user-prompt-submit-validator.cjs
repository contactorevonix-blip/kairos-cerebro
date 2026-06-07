/**
 * UserPromptSubmit Hook Validator
 * Validates user input BEFORE processing
 * Art III: Story-Driven Development enforcement
 */

module.exports = async (context) => {
  const { userInput, storyId, currentAgent } = context;

  // Check for story ID reference in implementation commands
  if (userInput?.includes('@dev') || userInput?.includes('@qa')) {
    if (!storyId || storyId === 'unknown') {
      return {
        warn: true,
        message: '⚠️ No active story detected. Use: @dev *develop-story <story-id>'
      };
    }
  }

  // Validate story context completeness
  if (currentAgent === 'dev' && userInput?.includes('*develop-story')) {
    const storyPath = `docs/stories/${extractStoryId(userInput)}.md`;
    if (!fileExists(storyPath)) {
      return {
        block: true,
        message: `❌ Story file not found: ${storyPath}`
      };
    }
  }

  return { block: false };
};

function extractStoryId(input) {
  const match = input.match(/(\d\.\d)/);
  return match ? match[1] : null;
}

function fileExists(path) {
  // Simplified check — in real implementation, verify file exists
  return path.includes('docs/stories/');
}
