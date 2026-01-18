/**
 * Tests for AWS Bedrock Claude Model Handler
 * 
 * These tests verify the fix for ROO-277: Bedrock Claude 3.7 Sonnet invalid beta flag error
 */

import {
  detectModelVersion,
  getModelConfig,
  createBedrockRequest,
  isModelSupported,
  getModelDisplayName,
  shouldIncludeBetaFlags,
  BedrockMessage,
} from './bedrock-model-handler';

describe('detectModelVersion', () => {
  it('should detect Claude 3.7 Sonnet model version', () => {
    const modelId = 'anthropic.claude-3-7-sonnet-20250219-v1:0';
    const result = detectModelVersion(modelId);
    
    expect(result.family).toBe('claude-3-7-sonnet');
    expect(result.version).toBe('20250219-v1');
  });
  
  it('should detect Claude 3.5 Sonnet (October 2024) version', () => {
    const modelId = 'anthropic.claude-3-5-sonnet-20241022-v2:0';
    const result = detectModelVersion(modelId);
    
    expect(result.family).toBe('claude-3-5-sonnet');
    expect(result.version).toBe('20241022-v2');
  });
  
  it('should detect Claude 3.5 Sonnet (June 2024) version', () => {
    const modelId = 'anthropic.claude-3-5-sonnet-20240620-v1:0';
    const result = detectModelVersion(modelId);
    
    expect(result.family).toBe('claude-3-5-sonnet');
    expect(result.version).toBe('20240620-v1');
  });
  
  it('should detect Claude 3 Opus model version', () => {
    const modelId = 'anthropic.claude-3-opus-20240229-v1:0';
    const result = detectModelVersion(modelId);
    
    expect(result.family).toBe('claude-3-opus');
    expect(result.version).toBe('20240229-v1');
  });
  
  it('should detect Claude 3 Haiku model version', () => {
    const modelId = 'anthropic.claude-3-haiku-20240307-v1:0';
    const result = detectModelVersion(modelId);
    
    expect(result.family).toBe('claude-3-haiku');
    expect(result.version).toBe('20240307-v1');
  });
  
  it('should handle legacy model ID formats', () => {
    const modelId = 'anthropic.claude-3-sonnet';
    const result = detectModelVersion(modelId);
    
    expect(result.family).toBe('claude-3-sonnet');
    expect(result.version).toBe('legacy');
  });
  
  it('should return unknown for invalid model IDs', () => {
    const modelId = 'invalid-model-id';
    const result = detectModelVersion(modelId);
    
    expect(result.family).toBe('unknown');
    expect(result.version).toBe('unknown');
  });
});

describe('getModelConfig', () => {
  describe('Claude 3.7 Sonnet - The fix for ROO-277', () => {
    it('should NOT require beta flags for Claude 3.7 Sonnet', () => {
      const modelId = 'anthropic.claude-3-7-sonnet-20250219-v1:0';
      const config = getModelConfig(modelId);
      
      expect(config.requiresBetaFlags).toEqual([]);
      expect(config.requiresBetaFlags.length).toBe(0);
    });
    
    it('should indicate Claude 3.7 Sonnet supports prompt caching natively', () => {
      const modelId = 'anthropic.claude-3-7-sonnet-20250219-v1:0';
      const config = getModelConfig(modelId);
      
      expect(config.supportsPromptCaching).toBe(true);
    });
    
    it('should have correct display name for Claude 3.7 Sonnet', () => {
      const modelId = 'anthropic.claude-3-7-sonnet-20250219-v1:0';
      const config = getModelConfig(modelId);
      
      expect(config.displayName).toBe('Claude 3.7 Sonnet');
    });
  });
  
  describe('Claude 3.5 Sonnet - Legacy behavior', () => {
    it('should require prompt caching beta flag for Claude 3.5 Sonnet (October)', () => {
      const modelId = 'anthropic.claude-3-5-sonnet-20241022-v2:0';
      const config = getModelConfig(modelId);
      
      expect(config.requiresBetaFlags).toContain('prompt-caching-2024-07-31');
      expect(config.supportsPromptCaching).toBe(true);
    });
    
    it('should require prompt caching beta flag for Claude 3.5 Sonnet (June)', () => {
      const modelId = 'anthropic.claude-3-5-sonnet-20240620-v1:0';
      const config = getModelConfig(modelId);
      
      expect(config.requiresBetaFlags).toContain('prompt-caching-2024-07-31');
    });
  });
  
  describe('Claude 3 models', () => {
    it('should not require beta flags for Claude 3 Opus', () => {
      const modelId = 'anthropic.claude-3-opus-20240229-v1:0';
      const config = getModelConfig(modelId);
      
      expect(config.requiresBetaFlags).toEqual([]);
      expect(config.supportsPromptCaching).toBe(false);
    });
    
    it('should not require beta flags for Claude 3 Haiku', () => {
      const modelId = 'anthropic.claude-3-haiku-20240307-v1:0';
      const config = getModelConfig(modelId);
      
      expect(config.requiresBetaFlags).toEqual([]);
      expect(config.supportsPromptCaching).toBe(false);
    });
    
    it('should not require beta flags for Claude 3 Sonnet', () => {
      const modelId = 'anthropic.claude-3-sonnet-20240229-v1:0';
      const config = getModelConfig(modelId);
      
      expect(config.requiresBetaFlags).toEqual([]);
      expect(config.supportsPromptCaching).toBe(false);
    });
  });
  
  it('should return safe defaults for unknown models', () => {
    const modelId = 'anthropic.claude-future-model';
    const config = getModelConfig(modelId);
    
    expect(config.requiresBetaFlags).toEqual([]);
    expect(config.supportsPromptCaching).toBe(false);
    expect(config.displayName).toBe('Claude (Unknown Version)');
  });
});

describe('createBedrockRequest', () => {
  const testMessages: BedrockMessage[] = [
    { role: 'user', content: 'Hello, Claude!' },
  ];
  
  describe('Claude 3.7 Sonnet - The fix for ROO-277', () => {
    it('should create request WITHOUT anthropic_version for Claude 3.7 Sonnet', () => {
      const modelId = 'anthropic.claude-3-7-sonnet-20250219-v1:0';
      const request = createBedrockRequest(modelId, testMessages);
      
      // This is the key fix: no anthropic_version field should be present
      expect(request).not.toHaveProperty('anthropic_version');
      expect(request.messages).toEqual(testMessages);
      expect(request.max_tokens).toBe(4096);
    });
    
    it('should respect custom maxTokens for Claude 3.7 Sonnet', () => {
      const modelId = 'anthropic.claude-3-7-sonnet-20250219-v1:0';
      const request = createBedrockRequest(modelId, testMessages, { maxTokens: 2048 });
      
      expect(request.max_tokens).toBe(2048);
      expect(request).not.toHaveProperty('anthropic_version');
    });
    
    it('should include temperature when provided for Claude 3.7 Sonnet', () => {
      const modelId = 'anthropic.claude-3-7-sonnet-20250219-v1:0';
      const request = createBedrockRequest(modelId, testMessages, { temperature: 0.7 });
      
      expect(request.temperature).toBe(0.7);
      expect(request).not.toHaveProperty('anthropic_version');
    });
    
    it('should include topP when provided for Claude 3.7 Sonnet', () => {
      const modelId = 'anthropic.claude-3-7-sonnet-20250219-v1:0';
      const request = createBedrockRequest(modelId, testMessages, { topP: 0.9 });
      
      expect(request.top_p).toBe(0.9);
      expect(request).not.toHaveProperty('anthropic_version');
    });
    
    it('should include system prompt when provided for Claude 3.7 Sonnet', () => {
      const modelId = 'anthropic.claude-3-7-sonnet-20250219-v1:0';
      const systemPrompt = 'You are a helpful assistant.';
      const request = createBedrockRequest(modelId, testMessages, { system: systemPrompt });
      
      expect(request.system).toBe(systemPrompt);
      expect(request).not.toHaveProperty('anthropic_version');
    });
    
    it('should handle all options together for Claude 3.7 Sonnet', () => {
      const modelId = 'anthropic.claude-3-7-sonnet-20250219-v1:0';
      const request = createBedrockRequest(modelId, testMessages, {
        maxTokens: 1024,
        temperature: 0.5,
        topP: 0.8,
        system: 'Test system prompt',
      });
      
      expect(request.max_tokens).toBe(1024);
      expect(request.temperature).toBe(0.5);
      expect(request.top_p).toBe(0.8);
      expect(request.system).toBe('Test system prompt');
      expect(request).not.toHaveProperty('anthropic_version');
    });
  });
  
  describe('Claude 3.5 Sonnet - Legacy behavior', () => {
    it('should include anthropic_version for Claude 3.5 Sonnet', () => {
      const modelId = 'anthropic.claude-3-5-sonnet-20241022-v2:0';
      const request = createBedrockRequest(modelId, testMessages);
      
      expect(request.anthropic_version).toBe('bedrock-2023-05-31');
      expect(request.messages).toEqual(testMessages);
    });
  });
  
  describe('Claude 3 models', () => {
    it('should not include anthropic_version for Claude 3 Opus', () => {
      const modelId = 'anthropic.claude-3-opus-20240229-v1:0';
      const request = createBedrockRequest(modelId, testMessages);
      
      expect(request).not.toHaveProperty('anthropic_version');
    });
    
    it('should not include anthropic_version for Claude 3 Haiku', () => {
      const modelId = 'anthropic.claude-3-haiku-20240307-v1:0';
      const request = createBedrockRequest(modelId, testMessages);
      
      expect(request).not.toHaveProperty('anthropic_version');
    });
  });
  
  describe('Complex message formats', () => {
    it('should handle messages with complex content', () => {
      const modelId = 'anthropic.claude-3-7-sonnet-20250219-v1:0';
      const complexMessages: BedrockMessage[] = [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'What is in this image?' },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: 'base64-encoded-data-here',
              },
            },
          ],
        },
      ];
      
      const request = createBedrockRequest(modelId, complexMessages);
      
      expect(request.messages).toEqual(complexMessages);
      expect(request).not.toHaveProperty('anthropic_version');
    });
  });
});

describe('isModelSupported', () => {
  it('should return true for Claude 3.7 Sonnet', () => {
    expect(isModelSupported('anthropic.claude-3-7-sonnet-20250219-v1:0')).toBe(true);
  });
  
  it('should return true for Claude 3.5 Sonnet', () => {
    expect(isModelSupported('anthropic.claude-3-5-sonnet-20241022-v2:0')).toBe(true);
  });
  
  it('should return true for Claude 3 models', () => {
    expect(isModelSupported('anthropic.claude-3-opus-20240229-v1:0')).toBe(true);
    expect(isModelSupported('anthropic.claude-3-haiku-20240307-v1:0')).toBe(true);
  });
  
  it('should return false for invalid model IDs', () => {
    expect(isModelSupported('invalid-model-id')).toBe(false);
  });
});

describe('getModelDisplayName', () => {
  it('should return correct display name for Claude 3.7 Sonnet', () => {
    expect(getModelDisplayName('anthropic.claude-3-7-sonnet-20250219-v1:0')).toBe('Claude 3.7 Sonnet');
  });
  
  it('should return correct display name for Claude 3.5 Sonnet', () => {
    expect(getModelDisplayName('anthropic.claude-3-5-sonnet-20241022-v2:0')).toBe('Claude 3.5 Sonnet');
  });
  
  it('should return correct display name for Claude 3 Opus', () => {
    expect(getModelDisplayName('anthropic.claude-3-opus-20240229-v1:0')).toBe('Claude 3 Opus');
  });
  
  it('should return default display name for unknown models', () => {
    expect(getModelDisplayName('unknown-model')).toBe('Claude (Unknown Version)');
  });
});

describe('shouldIncludeBetaFlags', () => {
  it('should return false for Claude 3.7 Sonnet (the fix for ROO-277)', () => {
    const modelId = 'anthropic.claude-3-7-sonnet-20250219-v1:0';
    expect(shouldIncludeBetaFlags(modelId)).toBe(false);
  });
  
  it('should return true for Claude 3.5 Sonnet', () => {
    const modelId = 'anthropic.claude-3-5-sonnet-20241022-v2:0';
    expect(shouldIncludeBetaFlags(modelId)).toBe(true);
  });
  
  it('should return false for Claude 3 Opus', () => {
    const modelId = 'anthropic.claude-3-opus-20240229-v1:0';
    expect(shouldIncludeBetaFlags(modelId)).toBe(false);
  });
  
  it('should return false for Claude 3 Haiku', () => {
    const modelId = 'anthropic.claude-3-haiku-20240307-v1:0';
    expect(shouldIncludeBetaFlags(modelId)).toBe(false);
  });
  
  it('should return false for unknown models (safe default)', () => {
    const modelId = 'unknown-model';
    expect(shouldIncludeBetaFlags(modelId)).toBe(false);
  });
});

describe('Integration tests - Real-world scenarios', () => {
  describe('ROO-277 regression tests', () => {
    it('should create valid request for Claude 3.7 Sonnet without beta flags', () => {
      const modelId = 'anthropic.claude-3-7-sonnet-20250219-v1:0';
      const messages: BedrockMessage[] = [
        { role: 'user', content: 'Explain quantum computing' },
      ];
      
      const request = createBedrockRequest(modelId, messages, {
        maxTokens: 2048,
        temperature: 0.7,
      });
      
      // Verify the request structure is valid for Bedrock
      expect(request.messages).toBeDefined();
      expect(request.max_tokens).toBe(2048);
      expect(request.temperature).toBe(0.7);
      
      // Most importantly: no anthropic_version field that would cause "invalid beta flag" error
      expect(request).not.toHaveProperty('anthropic_version');
      
      // Verify no beta flags are required
      const config = getModelConfig(modelId);
      expect(config.requiresBetaFlags).toEqual([]);
    });
    
    it('should differentiate between Claude 3.5 and 3.7 correctly', () => {
      const model35 = 'anthropic.claude-3-5-sonnet-20241022-v2:0';
      const model37 = 'anthropic.claude-3-7-sonnet-20250219-v1:0';
      
      const config35 = getModelConfig(model35);
      const config37 = getModelConfig(model37);
      
      // 3.5 requires beta flags
      expect(config35.requiresBetaFlags.length).toBeGreaterThan(0);
      
      // 3.7 does NOT require beta flags (the fix)
      expect(config37.requiresBetaFlags.length).toBe(0);
    });
  });
  
  describe('Backward compatibility', () => {
    it('should still work correctly with Claude 3.5 Sonnet', () => {
      const modelId = 'anthropic.claude-3-5-sonnet-20241022-v2:0';
      const messages: BedrockMessage[] = [
        { role: 'user', content: 'Hello' },
      ];
      
      const request = createBedrockRequest(modelId, messages);
      
      // 3.5 should include the anthropic_version
      expect(request.anthropic_version).toBe('bedrock-2023-05-31');
    });
    
    it('should work correctly with all Claude 3 variants', () => {
      const models = [
        'anthropic.claude-3-opus-20240229-v1:0',
        'anthropic.claude-3-sonnet-20240229-v1:0',
        'anthropic.claude-3-haiku-20240307-v1:0',
      ];
      
      models.forEach(modelId => {
        const config = getModelConfig(modelId);
        expect(config.requiresBetaFlags).toEqual([]);
        expect(isModelSupported(modelId)).toBe(true);
      });
    });
  });
});
