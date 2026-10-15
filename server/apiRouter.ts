import { Router, Request, Response } from 'express';
import { analyzeMineAtmosphere, askRescueAssistant } from './geminiService';

export const apiRouter = Router();

// Gemini atmospheric risk evaluation endpoint
apiRouter.post('/gemini/analyze', async (req: Request, res: Response) => {
  try {
    const { temperature, humidity, mq8Gas, shaftZone, activeAlertsCount } = req.body;
    const analysis = await analyzeMineAtmosphere({
      temperature: Number(temperature) || 25,
      humidity: Number(humidity) || 60,
      mq8Gas: Number(mq8Gas) || 120,
      shaftZone: shaftZone || 'Shaft 2 (-320m Face)',
      activeAlertsCount: Number(activeAlertsCount) || 0,
    });
    res.json({ success: true, analysis });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown AI evaluation error';
    res.status(500).json({ success: false, error: msg });
  }
});

// Gemini mine rescue advice endpoint
apiRouter.post('/gemini/assistant', async (req: Request, res: Response) => {
  try {
    const { question, context } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, error: 'Question required' });
    }
    const result = await askRescueAssistant(question, context || 'Underground coal mine shaft');
    res.json({ success: true, answer: result.answer });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Assistant query failed';
    res.status(500).json({ success: false, error: msg });
  }
});

// Blynk IoT Cloud proxy endpoint (Blynk blr1 region API)
// Resolves: https://blr1.blynk.cloud/external/api/get?token={device_token}&V2
// Resolves: https://blr1.blynk.cloud/external/api/get?token={device_token}&V3
apiRouter.get('/blynk/fetch', async (req: Request, res: Response) => {
  const token = req.query.token as string;
  const pin = (req.query.pin as string) || 'V2';

  if (!token) {
    return res.status(400).json({ success: false, error: 'Missing device_token query parameter' });
  }

  const blynkUrl = `https://blr1.blynk.cloud/external/api/get?token=${encodeURIComponent(token)}&${encodeURIComponent(pin)}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const blynkResponse = await fetch(blynkUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'RockRover-IoT-Gateway/1.0',
      },
    });
    clearTimeout(timeout);

    if (blynkResponse.ok) {
      const text = await blynkResponse.text();
      // Blynk returns raw value or string array
      let parsedValue: number | string = text;
      try {
        const json = JSON.parse(text);
        parsedValue = Array.isArray(json) ? json[0] : json;
      } catch {
        // text is already raw number/string
      }
      return res.json({
        success: true,
        pin,
        value: parsedValue,
        sourceUrl: blynkUrl.replace(token, 'TOKEN_REDACTED'),
        status: blynkResponse.status,
      });
    } else {
      return res.json({
        success: false,
        error: `Blynk Cloud returned HTTP ${blynkResponse.status} (${blynkResponse.statusText})`,
        pin,
        offline: true,
      });
    }
  } catch (error: unknown) {
    const isAbort = error instanceof Error && error.name === 'AbortError';
    return res.json({
      success: false,
      error: isAbort ? 'Blynk Cloud request timed out (device offline or invalid token)' : 'Network unreachable',
      offline: true,
    });
  }
});

// MQTT Publish handler endpoint
// User command format: mqtt.publish("get/ds","temperature ") / mqtt.publish("get/ds","Humidity")
apiRouter.post('/mqtt/publish', (req: Request, res: Response) => {
  const { topic, payload } = req.body;
  if (!topic) {
    return res.status(400).json({ success: false, error: 'Topic is required' });
  }

  // Simulated broker delivery confirmation
  const timestamp = new Date().toISOString();
  console.log(`[MQTT BROKER] Published to [${topic}]: "${payload}" at ${timestamp}`);

  res.json({
    success: true,
    message: `Message published to topic '${topic}'`,
    topic,
    payload,
    timestamp,
    qos: 1,
    broker: 'mqtt://blr1.blynk.cloud / internal-iot-broker',
  });
});
