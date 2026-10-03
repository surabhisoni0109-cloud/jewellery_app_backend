import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import {
  getMessaging,
  Message,
  MulticastMessage,
  TopicMessage,
  MessagingTopicManagementResponse,
  SendResponse,
} from 'firebase-admin/messaging';
import * as fs from 'fs';
import * as path from 'path';

export interface PushNotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
}

export interface MulticastSendResult {
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
}

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: App | null = null;
  private isConfigured: boolean = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.initializeFirebase();
  }

  private formatPrivateKey(key: string): string {
    let formatted = key.trim();
    // Remove enclosing double or single quotes if present
    if (
      (formatted.startsWith('"') && formatted.endsWith('"')) ||
      (formatted.startsWith("'") && formatted.endsWith("'"))
    ) {
      formatted = formatted.slice(1, -1);
    }
    // Replace escaped \n with actual newlines
    return formatted.replace(/\\n/g, '\n');
  }

  private initializeFirebase() {
    try {
      const apps = getApps();
      if (apps.length > 0) {
        this.app = apps[0];
        this.isConfigured = true;
        this.logger.log('Existing Firebase Admin SDK application reused.');
        return;
      }

      // ── Primary Method: Individual Environment Variables ─────────────────
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
      const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
      const privateKeyRaw = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

      if (projectId && clientEmail && privateKeyRaw) {
        const privateKey = this.formatPrivateKey(privateKeyRaw);
        this.app = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
          projectId,
        });
        this.isConfigured = true;
        this.logger.log(
          `Firebase Admin SDK initialized successfully with Project ID: ${projectId}`,
        );
        return;
      }

      // Check if partially provided to give helpful debugging feedback
      if (projectId || clientEmail || privateKeyRaw) {
        const missing: string[] = [];
        if (!projectId) missing.push('FIREBASE_PROJECT_ID');
        if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
        if (!privateKeyRaw) missing.push('FIREBASE_PRIVATE_KEY');
        this.logger.warn(
          `Incomplete Firebase credentials provided. Missing: ${missing.join(', ')}`,
        );
      }

      // ── Fallback 1: Service Account JSON File Path ───────────────────────
      const serviceAccountPath = this.configService.get<string>(
        'FIREBASE_SERVICE_ACCOUNT_PATH',
      );
      if (serviceAccountPath && serviceAccountPath.trim() !== '') {
        const resolvedPath = path.isAbsolute(serviceAccountPath)
          ? serviceAccountPath
          : path.resolve(process.cwd(), serviceAccountPath);

        if (fs.existsSync(resolvedPath)) {
          const serviceAccount = JSON.parse(
            fs.readFileSync(resolvedPath, 'utf8'),
          );
          this.app = initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.project_id,
          });
          this.isConfigured = true;
          this.logger.log(
            `Firebase Admin SDK initialized from service account file: ${resolvedPath}`,
          );
          return;
        } else {
          this.logger.warn(
            `FIREBASE_SERVICE_ACCOUNT_PATH specified but file does not exist: ${resolvedPath}`,
          );
        }
      }

      // ── Fallback 2: Inline Service Account JSON String ────────────────────
      const serviceAccountJson = this.configService.get<string>(
        'FIREBASE_SERVICE_ACCOUNT_JSON',
      );
      if (serviceAccountJson && serviceAccountJson.trim() !== '') {
        const serviceAccount = JSON.parse(serviceAccountJson);
        this.app = initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });
        this.isConfigured = true;
        this.logger.log(
          'Firebase Admin SDK initialized from inline service account JSON.',
        );
        return;
      }

      // ── Fallback 3: Standard Google Application Default Credentials ──────
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        this.app = initializeApp({
          credential: applicationDefault(),
        });
        this.isConfigured = true;
        this.logger.log(
          'Firebase Admin SDK initialized using GOOGLE_APPLICATION_CREDENTIALS.',
        );
        return;
      }

      // ── No credentials: Run in safe mock/simulation mode ─────────────────
      this.isConfigured = false;
      this.logger.warn(
        '⚠️ Firebase Admin SDK is NOT configured. Push notifications will run in mock/console mode. To activate, set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your .env file.',
      );
    } catch (error: any) {
      this.isConfigured = false;
      this.logger.error(
        `Failed to initialize Firebase Admin SDK: ${error.message}`,
        error.stack,
      );
    }
  }

  public isReady(): boolean {
    return this.isConfigured && !!this.app;
  }

  /**
   * Send a push notification to a single device token.
   */
  async sendToDevice(
    token: string,
    payload: PushNotificationPayload,
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
    isTokenInvalid?: boolean;
  }> {
    if (!token || token.trim() === '') {
      return { success: false, error: 'Empty registration token' };
    }

    if (!this.isReady() || !this.app) {
      this.logger.log(
        `[MOCK FCM NOTIFICATION] To Token: ${token} | Title: "${payload.title}" | Body: "${payload.body}" | Data: ${JSON.stringify(payload.data || {})}`,
      );
      return {
        success: true,
        messageId: `mock-msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      };
    }

    try {
      const messaging = getMessaging(this.app);
      const message: Message = {
        token,
        notification: {
          title: payload.title,
          body: payload.body,
          ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
        },
        data: payload.data || {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'jewellery_notifications',
            ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
          ...(payload.imageUrl
            ? {
                fcmOptions: {
                  imageUrl: payload.imageUrl,
                },
              }
            : {}),
        },
      };

      const response = await messaging.send(message);
      this.logger.log(`Push notification sent successfully: ${response}`);
      return { success: true, messageId: response };
    } catch (error: any) {
      this.logger.error(
        `Failed to send FCM notification to token "${token}": ${error.message}`,
      );
      const isTokenInvalid =
        error.code === 'messaging/registration-token-not-registered' ||
        error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/invalid-argument';

      return {
        success: false,
        error: error.message,
        isTokenInvalid,
      };
    }
  }

  /**
   * Send push notification to multiple device tokens (multicast).
   */
  async sendMulticast(
    tokens: string[],
    payload: PushNotificationPayload,
  ): Promise<MulticastSendResult> {
    if (!tokens || tokens.length === 0) {
      return { successCount: 0, failureCount: 0, invalidTokens: [] };
    }

    // Filter out duplicate tokens
    const uniqueTokens = Array.from(
      new Set(tokens.filter((t) => t && t.trim() !== '')),
    );
    if (uniqueTokens.length === 0) {
      return { successCount: 0, failureCount: 0, invalidTokens: [] };
    }

    if (!this.isReady() || !this.app) {
      this.logger.log(
        `[MOCK FCM MULTICAST] To ${uniqueTokens.length} tokens | Title: "${payload.title}" | Body: "${payload.body}"`,
      );
      return {
        successCount: uniqueTokens.length,
        failureCount: 0,
        invalidTokens: [],
      };
    }

    const messaging = getMessaging(this.app);
    // FCM sendEachForMulticast accepts max 500 tokens per batch
    const batchSize = 500;
    let totalSuccess = 0;
    let totalFailure = 0;
    const invalidTokens: string[] = [];

    for (let i = 0; i < uniqueTokens.length; i += batchSize) {
      const batchTokens = uniqueTokens.slice(i, i + batchSize);

      try {
        const message: MulticastMessage = {
          tokens: batchTokens,
          notification: {
            title: payload.title,
            body: payload.body,
            ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
          },
          data: payload.data || {},
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              channelId: 'jewellery_notifications',
              ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
            },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
              },
            },
            ...(payload.imageUrl
              ? {
                  fcmOptions: {
                    imageUrl: payload.imageUrl,
                  },
                }
              : {}),
          },
        };

        const response = await messaging.sendEachForMulticast(message);
        totalSuccess += response.successCount;
        totalFailure += response.failureCount;

        response.responses.forEach((resp: SendResponse, idx: number) => {
          if (!resp.success && resp.error) {
            const errorCode = resp.error.code;
            if (
              errorCode === 'messaging/registration-token-not-registered' ||
              errorCode === 'messaging/invalid-registration-token' ||
              errorCode === 'messaging/invalid-argument'
            ) {
              invalidTokens.push(batchTokens[idx]);
            }
          }
        });
      } catch (batchError: any) {
        this.logger.error(
          `Batch multicast send error: ${batchError.message}`,
        );
        totalFailure += batchTokens.length;
      }
    }

    this.logger.log(
      `Multicast send finished. Success: ${totalSuccess}, Failures: ${totalFailure}, Invalid Tokens identified: ${invalidTokens.length}`,
    );

    return {
      successCount: totalSuccess,
      failureCount: totalFailure,
      invalidTokens,
    };
  }

  /**
   * Send push notification to a topic.
   */
  async sendToTopic(
    topic: string,
    payload: PushNotificationPayload,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!topic || topic.trim() === '') {
      return { success: false, error: 'Topic cannot be empty' };
    }

    const sanitizedTopic = topic.replace(/[^a-zA-Z0-9-_.~%]/g, '_');

    if (!this.isReady() || !this.app) {
      this.logger.log(
        `[MOCK FCM TOPIC] To Topic: "${sanitizedTopic}" | Title: "${payload.title}" | Body: "${payload.body}"`,
      );
      return {
        success: true,
        messageId: `mock-topic-msg-${Date.now()}`,
      };
    }

    try {
      const messaging = getMessaging(this.app);
      const message: TopicMessage = {
        topic: sanitizedTopic,
        notification: {
          title: payload.title,
          body: payload.body,
          ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
        },
        data: payload.data || {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'jewellery_notifications',
            ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      };

      const response = await messaging.send(message);
      this.logger.log(`Topic notification sent successfully: ${response}`);
      return { success: true, messageId: response };
    } catch (error: any) {
      this.logger.error(
        `Failed to send FCM topic message to "${sanitizedTopic}": ${error.message}`,
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Subscribe device tokens to a topic.
   */
  async subscribeToTopic(
    tokens: string[],
    topic: string,
  ): Promise<MessagingTopicManagementResponse | null> {
    if (!this.isReady() || !this.app) {
      this.logger.log(
        `[MOCK FCM] Subscribed ${tokens.length} tokens to topic: "${topic}"`,
      );
      return null;
    }

    try {
      const messaging = getMessaging(this.app);
      const sanitizedTopic = topic.replace(/[^a-zA-Z0-9-_.~%]/g, '_');
      const response = await messaging.subscribeToTopic(tokens, sanitizedTopic);
      this.logger.log(
        `Subscribed to topic "${sanitizedTopic}": ${response.successCount} success, ${response.failureCount} failed`,
      );
      return response;
    } catch (error: any) {
      this.logger.error(
        `Error subscribing tokens to topic "${topic}": ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Unsubscribe device tokens from a topic.
   */
  async unsubscribeFromTopic(
    tokens: string[],
    topic: string,
  ): Promise<MessagingTopicManagementResponse | null> {
    if (!this.isReady() || !this.app) {
      this.logger.log(
        `[MOCK FCM] Unsubscribed ${tokens.length} tokens from topic: "${topic}"`,
      );
      return null;
    }

    try {
      const messaging = getMessaging(this.app);
      const sanitizedTopic = topic.replace(/[^a-zA-Z0-9-_.~%]/g, '_');
      const response = await messaging.unsubscribeFromTopic(
        tokens,
        sanitizedTopic,
      );
      this.logger.log(
        `Unsubscribed from topic "${sanitizedTopic}": ${response.successCount} success, ${response.failureCount} failed`,
      );
      return response;
    } catch (error: any) {
      this.logger.error(
        `Error unsubscribing tokens from topic "${topic}": ${error.message}`,
      );
      return null;
    }
  }
}
