export class ApiClient {
  // Authentication and correlation header integration belongs to the auth/API-client task.
  constructor(private readonly baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '') {}
  getBaseUrl(): string {
    return this.baseUrl;
  }
}
