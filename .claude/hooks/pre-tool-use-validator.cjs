/**
 * PreToolUse Hook Validator
 * Validates each tool use BEFORE execution
 * Art II: Agent Authority enforcement
 */

module.exports = async (context) => {
  const { toolName, toolInput } = context;

  // Block git push (only @devops)
  if (toolName === 'Bash' && toolInput?.command?.includes('git push')) {
    return {
      block: true,
      message: '❌ Only @devops can execute git push. Use @devops *push instead.'
    };
  }

  // Block edit to L1/L2 (framework protected)
  if (toolName === 'Edit' && isL1L2Path(toolInput?.file_path)) {
    return {
      block: true,
      message: '❌ Framework core (L1/L2) is protected. Never modify .aiox-core/core/ or .aiox-core/development/. Contact @architect.'
    };
  }

  // Block story creation without @sm
  if (toolName === 'Write' && toolInput?.file_path?.includes('docs/stories')) {
    const currentAgent = context.currentAgent;
    if (currentAgent !== '@sm' && currentAgent !== 'sm') {
      return {
        block: true,
        message: '❌ Story creation is @sm exclusive. Use @sm *create-story instead.'
      };
    }
  }

  // Allow everything else
  return { block: false };
};

function isL1L2Path(path) {
  if (!path) return false;
  return path.includes('.aiox-core/core/') ||
         path.includes('.aiox-core/development/') ||
         path.includes('.aiox-core\\core\\') ||
         path.includes('.aiox-core\\development\\');
}
