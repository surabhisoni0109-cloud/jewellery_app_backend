import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagingTopicManagementResponse } from 'firebase-admin/messaging';
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
export declare class FirebaseService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private app;
    private isConfigured;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    private formatPrivateKey;
    private initializeFirebase;
    isReady(): boolean;
    sendToDevice(token: string, payload: PushNotificationPayload): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
        isTokenInvalid?: boolean;
    }>;
    sendMulticast(tokens: string[], payload: PushNotificationPayload): Promise<MulticastSendResult>;
    sendToTopic(topic: string, payload: PushNotificationPayload): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    subscribeToTopic(tokens: string[], topic: string): Promise<MessagingTopicManagementResponse | null>;
    unsubscribeFromTopic(tokens: string[], topic: string): Promise<MessagingTopicManagementResponse | null>;
}
