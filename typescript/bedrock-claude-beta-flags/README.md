# AWS Bedrock Claude 3.7 Sonnet Beta Flag Fix

This module addresses [ROO-277](https://linear.app/roocode/issue/ROO-277/bedrock-claude-37-sonnet-invalid-beta-flag-error): Invalid beta flag error when using AWS Bedrock with Claude 3.7 Sonnet.

## Problem

Users experienced the following error when using Claude 3.7 Sonnet via AWS Bedrock:

```
Unknown Error: The model returned the following errors: invalid beta flag
```

## Root Cause

Claude 3.7 Sonnet (released February 2025) does not support the same beta flags that were required for earlier Claude 3.5 Sonnet versions. The extension was including legacy beta flags that are not valid for this newer model.

## Solution

This module provides:

1. **Model version detection** - Identifies Claude model versions from model IDs
2. **Conditional beta flag handling** - Only includes beta flags for models that support them
3. **Bedrock-specific request building** - Creates properly formatted requests without invalid beta flags

### Key Features

- ✅ Detects Claude 3.7 Sonnet and excludes beta flags
- ✅ Maintains backward compatibility with Claude 3.5 Sonnet
- ✅ Provides clean API for creating Bedrock requests
- ✅ Comprehensive test coverage

## Installation

```bash
npm install
# or
pnpm install
```

## Usage

```typescript
import { getModelConfig, createBedrockRequest } from './bedrock-model-handler';

// Check model configuration
const config = getModelConfig('anthropic.claude-3-7-sonnet-20250219-v1:0');
console.log(config.requiresBetaFlags); // [] - no beta flags needed!

// Create a Bedrock request
const request = createBedrockRequest(
  'anthropic.claude-3-7-sonnet-20250219-v1:0',
  [{ role: 'user', content: 'Hello!' }],
  { maxTokens: 1024, temperature: 0.7 }
);

// The request will NOT include invalid beta flags
```

## Testing

Run the comprehensive test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

## Model Support

| Model | Beta Flags Required | Status |
|-------|-------------------|--------|
| Claude 3.7 Sonnet (2025-02) | None | ✅ Supported |
| Claude 3.5 Sonnet (2024-10) | `prompt-caching-2024-07-31` | ✅ Supported |
| Claude 3.5 Sonnet (2024-06) | `prompt-caching-2024-07-31` | ✅ Supported |
| Claude 3 (Opus, Sonnet, Haiku) | None | ✅ Supported |

## API Reference

### `detectModelVersion(modelId: string)`

Detects the Claude model family and version from a model ID.

**Returns:** `{ family: string, version: string }`

### `getModelConfig(modelId: string)`

Gets the configuration for a specific model, including beta flag requirements.

**Returns:** `ModelConfig`

### `createBedrockRequest(modelId, messages, options?)`

Creates a properly formatted Bedrock API request body without invalid beta flags.

**Parameters:**
- `modelId: string` - AWS Bedrock model ID
- `messages: Array<{role, content}>` - Conversation messages
- `options?: { maxTokens?, temperature?, topP?, system? }` - Optional request parameters

**Returns:** `BedrockRequestBody`

### `isModelSupported(modelId: string)`

Checks if a model ID is supported by this module.

**Returns:** `boolean`

### `getModelDisplayName(modelId: string)`

Gets a human-readable name for a model.

**Returns:** `string`

## Contributing

When adding support for new Claude models:

1. Update `detectModelVersion()` to recognize the model ID pattern
2. Add the model configuration in `getModelConfig()`
3. Add comprehensive tests in the test file
4. Update this README with the new model support

## Documentation

For detailed documentation about the issue and solution, see:
- [Bedrock Claude 3.7 Beta Flag Issue Documentation](../../docs/bedrock-claude-3.7-beta-flag-issue.md)

## Related Issues

- [ROO-277](https://linear.app/roocode/issue/ROO-277/bedrock-claude-37-sonnet-invalid-beta-flag-error) - Original issue report

## License

MIT
