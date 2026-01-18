/**
 * AWS Bedrock Claude Model Handler
 * 
 * Handles model-specific configuration for AWS Bedrock Claude models,
 * particularly addressing the invalid beta flag issue with Claude 3.7 Sonnet.
 * 
 * Related: ROO-277 - Bedrock Claude 3.7 Sonnet invalid beta flag error
 */

export interface ModelVersion {
  family: string;
  version: string;
}

export interface ModelConfig {
  modelId: string;
  displayName: string;
  requiresBetaFlags: string[];
  supportsPromptCaching: boolean;
}

export interface BedrockMessage {
  role: 'user' | 'assistant';
  content: string | Array<{
    type: string;
    text?: string;
    source?: {
      type: string;
      media_type: string;
      data: string;
    };
  }>;
}

export interface BedrockRequestOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  system?: string;
}

export interface BedrockRequestBody {
  anthropic_version?: string;
  messages: BedrockMessage[];
  max_tokens: number;
  temperature?: number;
  top_p?: number;
  system?: string;
}

/**
 * Detects the Claude model family and version from a model ID.
 * 
 * @param modelId - AWS Bedrock model ID (e.g., "anthropic.claude-3-7-sonnet-20250219-v1:0")
 * @returns Object containing family (e.g., "claude-3-7-sonnet") and version
 */
export function detectModelVersion(modelId: string): ModelVersion {
  // Match pattern with minor version: anthropic.claude-{major}-{minor}-{family}-{date}-v{version}:{revision}
  // e.g., anthropic.claude-3-7-sonnet-20250219-v1:0
  const patternWithMinor = /anthropic\.claude-([0-9]+)-([0-9]+)-(sonnet|opus|haiku)-(\d{8})-v([0-9]+):([0-9]+)/;
  const matchWithMinor = modelId.match(patternWithMinor);
  
  if (matchWithMinor) {
    const major = matchWithMinor[1]; // e.g., "3"
    const minor = matchWithMinor[2]; // e.g., "7" or "5"
    const family = matchWithMinor[3]; // sonnet, opus, haiku
    const date = matchWithMinor[4]; // YYYYMMDD
    const modelVersion = matchWithMinor[5]; // v1, v2, etc.
    
    return {
      family: `claude-${major}-${minor}-${family}`,
      version: `${date}-v${modelVersion}`,
    };
  }
  
  // Match pattern without minor version: anthropic.claude-{major}-{family}-{date}-v{version}:{revision}
  // e.g., anthropic.claude-3-opus-20240229-v1:0
  const patternWithoutMinor = /anthropic\.claude-([0-9]+)-(sonnet|opus|haiku)-(\d{8})-v([0-9]+):([0-9]+)/;
  const matchWithoutMinor = modelId.match(patternWithoutMinor);
  
  if (matchWithoutMinor) {
    const major = matchWithoutMinor[1]; // e.g., "3"
    const family = matchWithoutMinor[2]; // sonnet, opus, haiku
    const date = matchWithoutMinor[3]; // YYYYMMDD
    const modelVersion = matchWithoutMinor[4]; // v1, v2, etc.
    
    return {
      family: `claude-${major}-${family}`,
      version: `${date}-v${modelVersion}`,
    };
  }
  
  // Fallback for older model ID formats
  const legacyPattern = /anthropic\.claude-([0-9]+)-(sonnet|opus|haiku)/;
  const legacyMatch = modelId.match(legacyPattern);
  
  if (legacyMatch) {
    return {
      family: `claude-${legacyMatch[1]}-${legacyMatch[2]}`,
      version: 'legacy',
    };
  }
  
  return {
    family: 'unknown',
    version: 'unknown',
  };
}

/**
 * Gets the configuration for a specific Claude model.
 * 
 * @param modelId - AWS Bedrock model ID
 * @returns Model configuration including beta flag requirements
 */
export function getModelConfig(modelId: string): ModelConfig {
  const { family } = detectModelVersion(modelId);
  
  // Claude 3.7 Sonnet - NO beta flags needed (this is the fix for ROO-277)
  if (family.startsWith('claude-3-7-sonnet')) {
    return {
      modelId,
      displayName: 'Claude 3.7 Sonnet',
      requiresBetaFlags: [], // Empty - no beta flags for 3.7
      supportsPromptCaching: true, // Native support, no beta flag needed
    };
  }
  
  // Claude 3.5 Sonnet - requires prompt caching beta flag
  if (family.startsWith('claude-3-5-sonnet')) {
    return {
      modelId,
      displayName: 'Claude 3.5 Sonnet',
      requiresBetaFlags: ['prompt-caching-2024-07-31'],
      supportsPromptCaching: true,
    };
  }
  
  // Claude 3 Opus
  if (family.startsWith('claude-3-opus')) {
    return {
      modelId,
      displayName: 'Claude 3 Opus',
      requiresBetaFlags: [],
      supportsPromptCaching: false,
    };
  }
  
  // Claude 3 Haiku
  if (family.startsWith('claude-3-haiku')) {
    return {
      modelId,
      displayName: 'Claude 3 Haiku',
      requiresBetaFlags: [],
      supportsPromptCaching: false,
    };
  }
  
  // Claude 3 Sonnet (original)
  if (family.startsWith('claude-3-sonnet')) {
    return {
      modelId,
      displayName: 'Claude 3 Sonnet',
      requiresBetaFlags: [],
      supportsPromptCaching: false,
    };
  }
  
  // Unknown model - safe default (no beta flags)
  return {
    modelId,
    displayName: 'Claude (Unknown Version)',
    requiresBetaFlags: [],
    supportsPromptCaching: false,
  };
}

/**
 * Creates a properly formatted Bedrock API request body.
 * Automatically excludes beta flags for models that don't support them (like Claude 3.7 Sonnet).
 * 
 * @param modelId - AWS Bedrock model ID
 * @param messages - Array of conversation messages
 * @param options - Optional request parameters (maxTokens, temperature, etc.)
 * @returns Bedrock API request body
 */
export function createBedrockRequest(
  modelId: string,
  messages: BedrockMessage[],
  options: BedrockRequestOptions = {}
): BedrockRequestBody {
  const config = getModelConfig(modelId);
  
  const request: BedrockRequestBody = {
    messages,
    max_tokens: options.maxTokens ?? 4096,
  };
  
  // Only include anthropic_version for models that don't require beta flags
  // For Claude 3.7, we use the default version without beta flags
  if (config.requiresBetaFlags.length === 0) {
    // Don't include anthropic_version at all for Claude 3.7
    // Bedrock will use the appropriate default
  } else {
    // For older models that need beta flags, include them
    request.anthropic_version = 'bedrock-2023-05-31';
  }
  
  if (options.temperature !== undefined) {
    request.temperature = options.temperature;
  }
  
  if (options.topP !== undefined) {
    request.top_p = options.topP;
  }
  
  if (options.system) {
    request.system = options.system;
  }
  
  return request;
}

/**
 * Checks if a model ID is supported by this module.
 * 
 * @param modelId - AWS Bedrock model ID
 * @returns true if the model is recognized and supported
 */
export function isModelSupported(modelId: string): boolean {
  const { family } = detectModelVersion(modelId);
  return family !== 'unknown';
}

/**
 * Gets a human-readable display name for a model.
 * 
 * @param modelId - AWS Bedrock model ID
 * @returns Display name (e.g., "Claude 3.7 Sonnet")
 */
export function getModelDisplayName(modelId: string): string {
  const config = getModelConfig(modelId);
  return config.displayName;
}

/**
 * Determines if a model should include beta flags in requests.
 * This is the core fix for ROO-277: Claude 3.7 Sonnet returns false.
 * 
 * @param modelId - AWS Bedrock model ID
 * @returns true if the model requires beta flags
 */
export function shouldIncludeBetaFlags(modelId: string): boolean {
  const config = getModelConfig(modelId);
  return config.requiresBetaFlags.length > 0;
}
