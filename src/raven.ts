import type { ClientOptions } from "./client";
import { Client } from "./client";
import { Emails } from "./emails/emails";


export interface RavenOptions extends ClientOptions {
  // Additional Raven-specific options can be added here
}

/**
 * Main Raven SDK client for interacting with the Raven API
 * Acts as the entry point for all services
 */
export class Raven {
  private readonly client: Client;
  
  /**
   * Email operations
   */
  public readonly emails: Emails;
  
  // Additional services can be added here as needed
  
  /**
   * Create a new Raven SDK client
   *
   * @param key - API key for authentication
   * @param options - Configuration options
   */
  constructor(readonly key: string, options: RavenOptions = {}) {
    // Initialize the underlying HTTP client
    this.client = new Client(key, options);
    
    // Initialize service clients
    this.emails = new Emails(this.client);
    
  }
}