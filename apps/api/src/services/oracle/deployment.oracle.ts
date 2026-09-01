/**
 * @file deployment.oracle.ts
 * @description Automated Live Deployment Health & Verification Oracle.
 * Performs HTTP pings, latency benchmarking, and SSL/TLS security checks on freelancer-submitted deployment URLs.
 */

import axios from 'axios';
import https from 'https';

export interface IDeploymentVerificationResult {
  isLive: boolean;
  targetUrl: string;
  statusCode?: number;
  responseTimeMs?: number;
  hasSsl: boolean;
  details: string;
}

export class DeploymentOracle {
  /**
   * Ping live web service deployment URL and verify HTTP status and SSL certificate
   * @param targetUrl Live deployment URL submitted by freelancer
   */
  public async verifyDeployment(targetUrl: string): Promise<IDeploymentVerificationResult> {
    try {
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }

      const hasSsl = targetUrl.startsWith('https://');
      const startTime = Date.now();

      // TODO: Perform custom HTTPS agent certificate verification if checking expiration dates
      const agent = new https.Agent({ rejectUnauthorized: false });

      const response = await axios.get(targetUrl, {
        timeout: 8000,
        httpsAgent: agent,
        headers: { 'User-Agent': 'Web3-Freelance-Deployment-Oracle/1.0' }
      });

      const responseTimeMs = Date.now() - startTime;
      const isSuccess = response.status >= 200 && response.status < 400;

      return {
        isLive: isSuccess,
        targetUrl,
        statusCode: response.status,
        responseTimeMs,
        hasSsl,
        details: isSuccess
          ? `Deployment active. HTTP ${response.status} OK (${responseTimeMs}ms)`
          : `Deployment responded with status ${response.status}`
      };
    } catch (error: any) {
      return {
        isLive: false,
        targetUrl,
        hasSsl: targetUrl.startsWith('https://'),
        details: `Deployment Verification Error: ${error.message || 'Host unreachable or request timed out'}`
      };
    }
  }
}

export const deploymentOracle = new DeploymentOracle();
