import { useSettingsStore } from '../store';
import { generateId, sleep } from '../utils/cn';

// ============================================================
// OPENROUTER AI SERVICE
// ============================================================

export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

export const AVAILABLE_MODELS: OpenRouterModel[] = [
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Most capable Claude model for complex analysis and coding tasks',
    context_length: 200000,
    pricing: { prompt: '$3.00/M', completion: '$15.00/M' },
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Fast and efficient Claude model for quick responses',
    context_length: 200000,
    pricing: { prompt: '$0.25/M', completion: '$1.25/M' },
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'OpenAI\'s flagship multimodal model',
    context_length: 128000,
    pricing: { prompt: '$5.00/M', completion: '$15.00/M' },
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Smaller, faster GPT-4o for cost-effective tasks',
    context_length: 128000,
    pricing: { prompt: '$0.15/M', completion: '$0.60/M' },
  },
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    description: 'Google\'s advanced multimodal model with long context',
    context_length: 1000000,
    pricing: { prompt: '$3.50/M', completion: '$10.50/M' },
  },
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    description: 'Meta\'s powerful open-source language model',
    context_length: 131072,
    pricing: { prompt: '$0.59/M', completion: '$0.79/M' },
  },
  {
    id: 'deepseek/deepseek-coder',
    name: 'DeepSeek Coder',
    description: 'Specialized model for code generation and analysis',
    context_length: 16384,
    pricing: { prompt: '$0.14/M', completion: '$0.28/M' },
  },
  {
    id: 'mistralai/mistral-7b-instruct',
    name: 'Mistral 7B',
    description: 'Efficient open-source model for general tasks',
    context_length: 32768,
    pricing: { prompt: '$0.07/M', completion: '$0.07/M' },
  },
];

export interface ChatCompletionMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamChunk {
  token: string;
  done: boolean;
}

// ============================================================
// SIMULATED STREAMING AI RESPONSES
// ============================================================

const AI_RESPONSES = {
  code_review: `## AI Code Review Analysis

I've analyzed the code changes and here are my findings:

### 🟢 Strengths

1. **Clean Architecture** — The separation of concerns is well-implemented with clear boundaries between layers.
2. **Error Handling** — Comprehensive try/catch blocks with meaningful error messages.
3. **TypeScript Usage** — Proper type annotations throughout with no implicit any types.

### 🟡 Suggestions

1. **Performance Optimization**
\`\`\`typescript
// Consider memoizing this expensive computation
const processedData = useMemo(() => 
  expensiveTransformation(rawData), 
  [rawData]
);
\`\`\`

2. **Testing Coverage** — Add edge case tests for null/undefined inputs.

3. **Documentation** — JSDoc comments would improve maintainability.

### 🔴 Issues Found

- **Line 45**: Potential null reference exception when \`user?.profile\` is undefined
- **Line 78**: Missing await on async function call could cause race condition

### 📊 Risk Score: **3/10 (Low Risk)**

This PR is safe to merge after addressing the null reference issue on line 45.`,

  security: `## Security Analysis Report

### Critical Findings (1)

**🔴 CVE-2023-52160 — numpy Remote Code Execution**
- **Severity**: Critical (CVSS 9.8)
- **Package**: numpy 1.23.1
- **Fix**: Upgrade to numpy >= 1.24.0
- **Impact**: Arbitrary code execution via malicious array input

### High Findings (2)

**🟠 Exposed AWS Credentials**
- Found hardcoded AWS_ACCESS_KEY_ID in \`config/aws_config.py\`
- Immediate action: Rotate credentials via AWS IAM Console
- Prevention: Use AWS Secrets Manager or environment variables

**🟠 Kubernetes Root Container**
- Pod specification allows root execution
- Risk: Container escape attacks
- Fix: Set \`securityContext.runAsNonRoot: true\`

### Recommendations

1. Enable GitHub secret scanning for automatic detection
2. Implement SAST scanning in CI pipeline
3. Add dependency vulnerability scanning with Snyk or Dependabot
4. Review and rotate all hardcoded secrets immediately

### Overall Security Score: **61/100** ⚠️`,

  architecture: `## Architecture Analysis

### System Overview

Your codebase follows a **layered microservices architecture** with clear separation of concerns:

\`\`\`
┌─────────────────────────────────────┐
│         Client Layer (React)         │
├─────────────────────────────────────┤
│         API Gateway (Go)             │
├──────────────┬──────────────────────┤
│  AI Service  │  Repository Service   │
│  (Python)    │  (TypeScript)         │
├──────────────┴──────────────────────┤
│         Data Layer (PostgreSQL)      │
└─────────────────────────────────────┘
\`\`\`

### Strengths

- **Service Isolation**: Each service has a single responsibility
- **Event-Driven**: Async communication via message queues
- **Observability**: Structured logging with correlation IDs
- **Scalability**: Stateless services with horizontal scaling

### Recommendations

1. **Circuit Breakers** — Add resilience4j patterns for service-to-service calls
2. **API Versioning** — Implement versioned API endpoints for backward compatibility
3. **Caching Strategy** — Add Redis caching layer for frequently accessed data
4. **Service Mesh** — Consider Istio for advanced traffic management`,

  general: `I'm **GitMind AI**, your intelligent DevOps assistant. I can help you with:

### 🔍 Repository Analysis
- Code quality assessment
- Security vulnerability detection
- Dependency analysis
- Architecture review

### 🤖 AI Assistance
- Code review and suggestions
- Bug detection and fixes
- Performance optimization
- Documentation generation

### 📊 DevOps Intelligence
- Deployment monitoring
- CI/CD pipeline analysis
- Infrastructure recommendations
- Incident response guidance

### 💡 Example Commands
- *"Analyze the security posture of ml-pipeline"*
- *"Review the latest pull request for gitmind-core"*
- *"Explain the architecture of our API gateway"*
- *"What are the top risks in our current deployment?"*

What would you like to explore today?`,
};

const getContextualResponse = (message: string): string => {
  const lower = message.toLowerCase();
  if (lower.includes('security') || lower.includes('vulnerability') || lower.includes('cve')) {
    return AI_RESPONSES.security;
  }
  if (lower.includes('architecture') || lower.includes('design') || lower.includes('structure')) {
    return AI_RESPONSES.architecture;
  }
  if (lower.includes('review') || lower.includes('code') || lower.includes('pr') || lower.includes('pull request')) {
    return AI_RESPONSES.code_review;
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('help') || lower.includes('what can')) {
    return AI_RESPONSES.general;
  }

  // Generic response based on content
  return `## Analysis: ${message.slice(0, 60)}${message.length > 60 ? '...' : ''}

I've processed your request and here's what I found:

### Key Insights

Based on the context of your repositories and current system state:

1. **Immediate Action Required**: Review the critical security findings in \`ml-pipeline\` — there are 2 open critical vulnerabilities.

2. **Performance Consideration**: The \`api-gateway\` is handling traffic efficiently but may need capacity planning for Q4 growth projections.

3. **Code Quality**: Overall codebase health score is **86/100** — above industry average. Focus areas: test coverage in \`ml-pipeline\` and documentation in \`data-warehouse\`.

### Recommendations

\`\`\`bash
# Priority actions this sprint:
1. Patch numpy vulnerability: pip install numpy>=1.24.0
2. Rotate exposed AWS credentials immediately  
3. Add missing integration tests to ml-pipeline
4. Update Kubernetes pod security contexts
\`\`\`

### Context Memory

I've stored this interaction in my memory for future context. Type **/memory** to see all stored insights.

Is there a specific area you'd like me to dive deeper into?`;
};

// ============================================================
// STREAMING SIMULATION
// ============================================================
export async function* streamAIResponse(
  message: string,
  _conversationHistory: ChatCompletionMessage[] = [],
  onToken?: (token: string) => void
): AsyncGenerator<StreamChunk> {
  const settings = useSettingsStore.getState().settings;
  const apiKey = settings.openrouter_api_key;

  // If real API key is configured, attempt real API call
  if (apiKey && apiKey.length > 10) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'GitMind AI DevOps OS',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: settings.default_model,
          messages: [
            {
              role: 'system',
              content: `You are GitMind AI, an expert DevOps and software engineering assistant. You help with code review, security analysis, repository intelligence, deployment monitoring, and AI-powered development workflows. Be concise, technical, and actionable. Use markdown formatting.`,
            },
            ..._conversationHistory,
            { role: 'user', content: message },
          ],
          stream: true,
          max_tokens: 2048,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const data = JSON.parse(line.slice(6));
              const token = data.choices?.[0]?.delta?.content || '';
              if (token) {
                onToken?.(token);
                yield { token, done: false };
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      }

      yield { token: '', done: true };
      return;
    } catch (error) {
      console.warn('OpenRouter API error, falling back to simulation:', error);
    }
  }

  // Simulated streaming response
  const fullResponse = getContextualResponse(message);
  const words = fullResponse.split('');
  
  let buffer = '';
  for (let i = 0; i < words.length; i++) {
    buffer += words[i];
    
    // Emit token every few characters for smooth streaming
    if (buffer.length >= 3 || words[i] === '\n' || i === words.length - 1) {
      await sleep(15 + Math.random() * 20);
      onToken?.(buffer);
      yield { token: buffer, done: false };
      buffer = '';
    }
  }

  yield { token: '', done: true };
}

// ============================================================
// NON-STREAMING AI CALL
// ============================================================
export async function callAI(
  message: string,
  systemPrompt?: string,
  context?: string
): Promise<string> {
  const settings = useSettingsStore.getState().settings;
  const apiKey = settings.openrouter_api_key;

  const fullPrompt = context ? `${context}\n\n${message}` : message;

  if (apiKey && apiKey.length > 10) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'GitMind AI DevOps OS',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: settings.default_model,
          messages: [
            {
              role: 'system',
              content: systemPrompt || 'You are GitMind AI, an expert DevOps and software engineering assistant.',
            },
            { role: 'user', content: fullPrompt },
          ],
          max_tokens: 2048,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || getContextualResponse(message);
      }
    } catch {
      // Fall through to simulated response
    }
  }

  // Simulated response with delay
  await sleep(500 + Math.random() * 1000);
  return getContextualResponse(message);
}

// ============================================================
// REPOSITORY ANALYSIS
// ============================================================
export async function analyzeRepository(repoName: string, repoInfo?: string): Promise<string> {
  const prompt = `Analyze this repository and provide a comprehensive assessment:

Repository: ${repoName}
${repoInfo ? `Additional context: ${repoInfo}` : ''}

Provide:
1. Architecture overview
2. Code quality assessment  
3. Security posture
4. Dependency health
5. Performance considerations
6. Top 5 actionable recommendations`;

  return callAI(
    prompt,
    'You are an expert software architect and security engineer. Analyze repositories thoroughly and provide actionable insights.',
  );
}

// ============================================================
// PULL REQUEST REVIEW
// ============================================================
export async function reviewPullRequest(pr: {
  title: string;
  description: string;
  changes: string;
  additions: number;
  deletions: number;
}): Promise<string> {
  const prompt = `Review this pull request:

Title: ${pr.title}
Description: ${pr.description}
Statistics: +${pr.additions} -${pr.deletions} lines changed

Provide:
1. Risk assessment (1-10)
2. Code quality review
3. Security implications
4. Performance impact
5. Specific code suggestions
6. Merge recommendation`;

  return callAI(
    prompt,
    'You are a senior code reviewer with expertise in security and performance optimization.',
  );
}

// ============================================================
// SECURITY ANALYSIS
// ============================================================
export async function analyzeSecurityFindings(findings: unknown[]): Promise<string> {
  const prompt = `Analyze these security findings and provide remediation guidance:

Findings: ${JSON.stringify(findings, null, 2)}

Provide:
1. Priority order for remediation
2. Specific fix instructions for each
3. Prevention strategies
4. Security posture improvement roadmap`;

  return callAI(
    prompt,
    'You are a cybersecurity expert specializing in application security and DevSecOps.',
  );
}
