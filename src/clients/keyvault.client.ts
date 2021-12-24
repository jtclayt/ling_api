import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

/**
 * Client for retrieving secrets from Azure keyvault.
 */
export class KeyVaultClient {
  public static instance: KeyVaultClient = new KeyVaultClient();
  private secretClient: SecretClient;

  /** Ctor */
  constructor() {
    const credential = new DefaultAzureCredential();
    const url = `https://${process.env.KEY_VAULT_NAME}.vault.azure.net`;
    this.secretClient = new SecretClient(url, credential);
  }

  /**
   * Get a secret value from keyvault.
   * @param secretName The name for secret to retrieve.
   * @returns The value for the secret or throws error if cannot get.
   */
  async getSecretAsync(secretName: string): Promise<string> {
    const secret = await this.secretClient.getSecret(secretName);

    if (secret.value) return secret.value;
    throw new Error(`Secret for ${secretName} cannot be retrieved`);
  }
}
