import { DefaultAzureCredential } from "@azure/identity";
import { KeyVaultSecret, SecretClient } from "@azure/keyvault-secrets";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), 'env/.env')});

export class KeyVaultClient {
  public static instance: KeyVaultClient = new KeyVaultClient();
  private secretClient: SecretClient;

  constructor() {
    const credential = new DefaultAzureCredential();
    const url = `https://${process.env.KEY_VAULT_NAME}.vault.azure.net`;
    this.secretClient = new SecretClient(url, credential);
  }

  async getSecretAsync(secretName: string): Promise<string> {
    const secret = await this.secretClient.getSecret(secretName);
    return secret.value || "";
  }
}
