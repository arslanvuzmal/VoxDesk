import "server-only";

export class CloudflareAIError extends Error {
  constructor(
    message: string,
    public readonly code: string = "CLOUDFLARE_AI_ERROR",
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = "CloudflareAIError";
  }
}

export class CloudflareAITokenError extends CloudflareAIError {
  constructor(message: string = "Invalid or expired Cloudflare API token.") {
    super(message, "CLOUDFLARE_TOKEN_INVALID", 401);
    this.name = "CloudflareAITokenError";
  }
}

export class CloudflareAIRateLimitError extends CloudflareAIError {
  constructor(message: string = "Cloudflare AI rate limit reached.") {
    super(message, "CLOUDFLARE_RATE_LIMIT", 429);
    this.name = "CloudflareAIRateLimitError";
  }
}
