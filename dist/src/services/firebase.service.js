"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FirebaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_1 = require("firebase-admin/app");
const messaging_1 = require("firebase-admin/messaging");
const fs = require("fs");
const path = require("path");
let FirebaseService = FirebaseService_1 = class FirebaseService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(FirebaseService_1.name);
        this.app = null;
        this.isConfigured = false;
    }
    onModuleInit() {
        this.initializeFirebase();
    }
    formatPrivateKey(key) {
        let formatted = key.trim();
        if ((formatted.startsWith('"') && formatted.endsWith('"')) ||
            (formatted.startsWith("'") && formatted.endsWith("'"))) {
            formatted = formatted.slice(1, -1);
        }
        return formatted.replace(/\\n/g, '\n');
    }
    initializeFirebase() {
        try {
            const apps = (0, app_1.getApps)();
            if (apps.length > 0) {
                this.app = apps[0];
                this.isConfigured = true;
                this.logger.log('Existing Firebase Admin SDK application reused.');
                return;
            }
            const projectId = this.configService.get('FIREBASE_PROJECT_ID');
            const clientEmail = this.configService.get('FIREBASE_CLIENT_EMAIL');
            const privateKeyRaw = this.configService.get('FIREBASE_PRIVATE_KEY');
            if (projectId && clientEmail && privateKeyRaw) {
                const privateKey = this.formatPrivateKey(privateKeyRaw);
                this.app = (0, app_1.initializeApp)({
                    credential: (0, app_1.cert)({
                        projectId,
                        clientEmail,
                        privateKey,
                    }),
                    projectId,
                });
                this.isConfigured = true;
                this.logger.log(`Firebase Admin SDK initialized successfully with Project ID: ${projectId}`);
                return;
            }
            if (projectId || clientEmail || privateKeyRaw) {
                const missing = [];
                if (!projectId)
                    missing.push('FIREBASE_PROJECT_ID');
                if (!clientEmail)
                    missing.push('FIREBASE_CLIENT_EMAIL');
                if (!privateKeyRaw)
                    missing.push('FIREBASE_PRIVATE_KEY');
                this.logger.warn(`Incomplete Firebase credentials provided. Missing: ${missing.join(', ')}`);
            }
            const serviceAccountPath = this.configService.get('FIREBASE_SERVICE_ACCOUNT_PATH');
            if (serviceAccountPath && serviceAccountPath.trim() !== '') {
                const resolvedPath = path.isAbsolute(serviceAccountPath)
                    ? serviceAccountPath
                    : path.resolve(process.cwd(), serviceAccountPath);
                if (fs.existsSync(resolvedPath)) {
                    const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
                    this.app = (0, app_1.initializeApp)({
                        credential: (0, app_1.cert)(serviceAccount),
                        projectId: serviceAccount.project_id,
                    });
                    this.isConfigured = true;
                    this.logger.log(`Firebase Admin SDK initialized from service account file: ${resolvedPath}`);
                    return;
                }
                else {
                    this.logger.warn(`FIREBASE_SERVICE_ACCOUNT_PATH specified but file does not exist: ${resolvedPath}`);
                }
            }
            const serviceAccountJson = this.configService.get('FIREBASE_SERVICE_ACCOUNT_JSON');
            if (serviceAccountJson && serviceAccountJson.trim() !== '') {
                const serviceAccount = JSON.parse(serviceAccountJson);
                this.app = (0, app_1.initializeApp)({
                    credential: (0, app_1.cert)(serviceAccount),
                    projectId: serviceAccount.project_id,
                });
                this.isConfigured = true;
                this.logger.log('Firebase Admin SDK initialized from inline service account JSON.');
                return;
            }
            if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                this.app = (0, app_1.initializeApp)({
                    credential: (0, app_1.applicationDefault)(),
                });
                this.isConfigured = true;
                this.logger.log('Firebase Admin SDK initialized using GOOGLE_APPLICATION_CREDENTIALS.');
                return;
            }
            this.isConfigured = false;
            this.logger.warn('⚠️ Firebase Admin SDK is NOT configured. Push notifications will run in mock/console mode. To activate, set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your .env file.');
        }
        catch (error) {
            this.isConfigured = false;
            this.logger.error(`Failed to initialize Firebase Admin SDK: ${error.message}`, error.stack);
        }
    }
    isReady() {
        return this.isConfigured && !!this.app;
    }
    async sendToDevice(token, payload) {
        if (!token || token.trim() === '') {
            return { success: false, error: 'Empty registration token' };
        }
        if (!this.isReady() || !this.app) {
            this.logger.log(`[MOCK FCM NOTIFICATION] To Token: ${token} | Title: "${payload.title}" | Body: "${payload.body}" | Data: ${JSON.stringify(payload.data || {})}`);
            return {
                success: true,
                messageId: `mock-msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            };
        }
        try {
            const messaging = (0, messaging_1.getMessaging)(this.app);
            const message = {
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
        }
        catch (error) {
            this.logger.error(`Failed to send FCM notification to token "${token}": ${error.message}`);
            const isTokenInvalid = error.code === 'messaging/registration-token-not-registered' ||
                error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/invalid-argument';
            return {
                success: false,
                error: error.message,
                isTokenInvalid,
            };
        }
    }
    async sendMulticast(tokens, payload) {
        if (!tokens || tokens.length === 0) {
            return { successCount: 0, failureCount: 0, invalidTokens: [] };
        }
        const uniqueTokens = Array.from(new Set(tokens.filter((t) => t && t.trim() !== '')));
        if (uniqueTokens.length === 0) {
            return { successCount: 0, failureCount: 0, invalidTokens: [] };
        }
        if (!this.isReady() || !this.app) {
            this.logger.log(`[MOCK FCM MULTICAST] To ${uniqueTokens.length} tokens | Title: "${payload.title}" | Body: "${payload.body}"`);
            return {
                successCount: uniqueTokens.length,
                failureCount: 0,
                invalidTokens: [],
            };
        }
        const messaging = (0, messaging_1.getMessaging)(this.app);
        const batchSize = 500;
        let totalSuccess = 0;
        let totalFailure = 0;
        const invalidTokens = [];
        for (let i = 0; i < uniqueTokens.length; i += batchSize) {
            const batchTokens = uniqueTokens.slice(i, i + batchSize);
            try {
                const message = {
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
                response.responses.forEach((resp, idx) => {
                    if (!resp.success && resp.error) {
                        const errorCode = resp.error.code;
                        if (errorCode === 'messaging/registration-token-not-registered' ||
                            errorCode === 'messaging/invalid-registration-token' ||
                            errorCode === 'messaging/invalid-argument') {
                            invalidTokens.push(batchTokens[idx]);
                        }
                    }
                });
            }
            catch (batchError) {
                this.logger.error(`Batch multicast send error: ${batchError.message}`);
                totalFailure += batchTokens.length;
            }
        }
        this.logger.log(`Multicast send finished. Success: ${totalSuccess}, Failures: ${totalFailure}, Invalid Tokens identified: ${invalidTokens.length}`);
        return {
            successCount: totalSuccess,
            failureCount: totalFailure,
            invalidTokens,
        };
    }
    async sendToTopic(topic, payload) {
        if (!topic || topic.trim() === '') {
            return { success: false, error: 'Topic cannot be empty' };
        }
        const sanitizedTopic = topic.replace(/[^a-zA-Z0-9-_.~%]/g, '_');
        if (!this.isReady() || !this.app) {
            this.logger.log(`[MOCK FCM TOPIC] To Topic: "${sanitizedTopic}" | Title: "${payload.title}" | Body: "${payload.body}"`);
            return {
                success: true,
                messageId: `mock-topic-msg-${Date.now()}`,
            };
        }
        try {
            const messaging = (0, messaging_1.getMessaging)(this.app);
            const message = {
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
        }
        catch (error) {
            this.logger.error(`Failed to send FCM topic message to "${sanitizedTopic}": ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    async subscribeToTopic(tokens, topic) {
        if (!this.isReady() || !this.app) {
            this.logger.log(`[MOCK FCM] Subscribed ${tokens.length} tokens to topic: "${topic}"`);
            return null;
        }
        try {
            const messaging = (0, messaging_1.getMessaging)(this.app);
            const sanitizedTopic = topic.replace(/[^a-zA-Z0-9-_.~%]/g, '_');
            const response = await messaging.subscribeToTopic(tokens, sanitizedTopic);
            this.logger.log(`Subscribed to topic "${sanitizedTopic}": ${response.successCount} success, ${response.failureCount} failed`);
            return response;
        }
        catch (error) {
            this.logger.error(`Error subscribing tokens to topic "${topic}": ${error.message}`);
            return null;
        }
    }
    async unsubscribeFromTopic(tokens, topic) {
        if (!this.isReady() || !this.app) {
            this.logger.log(`[MOCK FCM] Unsubscribed ${tokens.length} tokens from topic: "${topic}"`);
            return null;
        }
        try {
            const messaging = (0, messaging_1.getMessaging)(this.app);
            const sanitizedTopic = topic.replace(/[^a-zA-Z0-9-_.~%]/g, '_');
            const response = await messaging.unsubscribeFromTopic(tokens, sanitizedTopic);
            this.logger.log(`Unsubscribed from topic "${sanitizedTopic}": ${response.successCount} success, ${response.failureCount} failed`);
            return response;
        }
        catch (error) {
            this.logger.error(`Error unsubscribing tokens from topic "${topic}": ${error.message}`);
            return null;
        }
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = FirebaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map