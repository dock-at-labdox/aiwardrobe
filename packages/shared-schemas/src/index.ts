// Hand-maintained pending an OpenAPI-to-TypeScript codegen step (see README.md).
export const CONTRACT_VERSION = '1.0.0';
export const JOB_STATUSES = ['queued', 'processing', 'succeeded', 'failed'] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];
export type CorrelationId = string;
export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    correlation_id?: CorrelationId;
    details?: Record<string, unknown>;
    retryable?: boolean;
  };
}
