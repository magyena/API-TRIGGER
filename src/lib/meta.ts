import crypto from 'crypto';

export function hashSHA256(value: string): string {
  if (!value) return '';
  const cleaned = value.trim().toLowerCase();
  return crypto.createHash('sha256').update(cleaned).digest('hex');
}

export interface MetaCapiEventPayload {
  eventName: string; // PageView, ViewContent, Lead, Contact, InitiateCheckout, AddPaymentInfo, Purchase
  eventId: string;
  eventTime?: number;
  eventSourceUrl: string;
  userEmail?: string;
  userPhone?: string;
  clientIp?: string;
  clientUserAgent?: string;
  fbclid?: string;
  ctwaClid?: string;
  customData?: Record<string, unknown>;
}

export interface CapiConfig {
  pixelId: string;
  accessToken: string;
  testEventCode?: string;
  apiVersion?: string;
}

export async function sendMetaCapiEvent(config: CapiConfig, event: MetaCapiEventPayload) {
  if (!config.pixelId || !config.accessToken) {
    console.warn('[Meta CAPI] Missing pixelId or accessToken');
    return { success: false, error: 'Missing configuration' };
  }

  const apiVersion = config.apiVersion || 'v19.0';
  const url = `https://graph.facebook.com/${apiVersion}/${config.pixelId}/events?access_token=${config.accessToken}`;

  const userData: Record<string, unknown> = {
    client_ip_address: event.clientIp || undefined,
    client_user_agent: event.clientUserAgent || undefined,
  };

  if (event.userEmail) {
    userData.em = [hashSHA256(event.userEmail)];
  }
  if (event.userPhone) {
    userData.ph = [hashSHA256(event.userPhone.replace(/\D/g, ''))];
  }
  if (event.fbclid) {
    userData.fbc = `fb.1.${Date.now()}.${event.fbclid}`;
  }

  const payload = {
    data: [
      {
        event_name: event.eventName,
        event_time: event.eventTime || Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        event_source_url: event.eventSourceUrl,
        action_source: 'website',
        user_data: userData,
        custom_data: event.customData || {},
      },
    ],
    ...(config.testEventCode ? { test_event_code: config.testEventCode } : {}),
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseData = await res.json();
    return {
      success: res.ok,
      status: res.status,
      data: responseData,
    };
  } catch (error) {
    console.error('[Meta CAPI Error]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}
