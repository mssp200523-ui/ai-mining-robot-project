import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini client strictly with User-Agent header per skill guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface MineAtmosphereInput {
  temperature: number; // °C
  humidity: number;    // %
  mq8Gas: number;      // ppm (combustible/H2)
  shaftZone: string;
  activeAlertsCount: number;
}

export async function analyzeMineAtmosphere(input: MineAtmosphereInput) {
  const prompt = `
You are the Chief AI Underground Mine Safety & Atmospheric Risk Officer for an underground deep mine.
Analyze the following live sensor telemetry:
- Temperature (DHT11): ${input.temperature}°C
- Relative Humidity (DHT11): ${input.humidity}%
- MQ8 Combustible/Hydrogen Gas: ${input.mq8Gas} ppm
- Monitored Mine Sector: ${input.shaftZone}
- Number of active system alerts: ${input.activeAlertsCount}

Reference Safety Standards (DGMS & MSHA):
- Normal temperature: 18-28°C. Above 32°C introduces heat exhaustion. Above 38°C is hazardous thermal combustion/fire condition.
- Normal humidity: 45-70%. Above 85% causes heavy condensation, respiratory strain, and roof fall/water seepage risk.
- MQ8 Gas (detects Hydrogen & combustible gases like Methane/CO): Normal < 200 ppm. Elevated: 200-400 ppm. Dangerous Lower Explosive Limit (LEL) pre-cursor: > 500 ppm.

Calculate the hazard score (0 to 100), overall risk assessment, thermal stress index, explosion risk according to combustible gas concentration, ventilation recommendations, and clear tactical action plan for underground miners and rescue squad.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert underground mining safety system. Return strictly valid JSON matching the requested schema without markdown formatting or backticks.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hazardScore: {
              type: Type.NUMBER,
              description: 'Overall hazard score from 0 (completely safe) to 100 (catastrophic danger)',
            },
            overallRisk: {
              type: Type.STRING,
              description: 'Risk tier: SAFE, ELEVATED, HAZARDOUS, or CRITICAL_DANGER',
            },
            summary: {
              type: Type.STRING,
              description: 'Concise 2-sentence synopsis of the underground atmosphere',
            },
            gasExplosionRisk: {
              type: Type.STRING,
              description: 'Analysis of MQ8 flammable gas reading and Cowards triangle / explosive potential',
            },
            thermalStressIndex: {
              type: Type.STRING,
              description: 'Evaluation of DHT11 heat index and humidity effects on miner physiological limits',
            },
            ventilationStatus: {
              type: Type.STRING,
              description: 'Recommended air flow velocity and damper settings',
            },
            recommendedAction: {
              type: Type.STRING,
              description: 'Immediate tactical directive for shift supervisor',
            },
            evacuationRecommended: {
              type: Type.BOOLEAN,
              description: 'Whether immediate evacuation of the shaft zone is required',
            },
            safeExitShaft: {
              type: Type.STRING,
              description: 'Recommended escape airway (e.g. Shaft 1 Intake Hoist or Auxiliary Escapeway)',
            },
            keyHazards: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Bullet list of active primary hazards identified',
            },
          },
          required: [
            'hazardScore',
            'overallRisk',
            'summary',
            'gasExplosionRisk',
            'thermalStressIndex',
            'ventilationStatus',
            'recommendedAction',
            'evacuationRecommended',
            'safeExitShaft',
            'keyHazards',
          ],
        },
      },
    });

    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini Mine Atmosphere Analysis Error:', error);
    // Intelligent deterministic fallback based on physical sensor values if AI service unavailable
    const isCritical = input.mq8Gas >= 600 || input.temperature >= 38;
    const isElevated = input.mq8Gas >= 300 || input.temperature >= 32;
    return {
      hazardScore: isCritical ? 85 : isElevated ? 55 : 15,
      overallRisk: isCritical ? 'CRITICAL_DANGER' : isElevated ? 'HAZARDOUS' : 'SAFE',
      summary: `Atmosphere monitored in ${input.shaftZone}: Temp ${input.temperature}°C, Humidity ${input.humidity}%, MQ8 ${input.mq8Gas} ppm.`,
      gasExplosionRisk:
        input.mq8Gas >= 500
          ? 'Combustible gas concentration approaching critical threshold. Immediate ignition lockout advised.'
          : 'Gas levels within manageable ventilation envelope.',
      thermalStressIndex:
        input.temperature >= 35
          ? 'High wet-bulb globe temperature warning. Work-rest regimen required.'
          : 'Thermal comfort within operational standards.',
      ventilationStatus:
        input.mq8Gas >= 400 ? 'Increase intake booster fan capacity to 100% in Sector.' : 'Standard flow rate (15 m³/s) adequate.',
      recommendedAction: isCritical
        ? 'Sound evacuation siren and isolate electrical circuits in sector.'
        : 'Continue automated sensor polling.',
      evacuationRecommended: isCritical,
      safeExitShaft: 'Shaft 1 Primary Airway (Intake Tower)',
      keyHazards: [
        ...(input.mq8Gas >= 300 ? [`MQ8 Flammable gas reading: ${input.mq8Gas} ppm`] : []),
        ...(input.temperature >= 32 ? [`High ambient temperature: ${input.temperature}°C`] : []),
        ...(input.humidity >= 80 ? [`Elevated humidity: ${input.humidity}%`] : []),
      ],
    };
  }
}

export async function askRescueAssistant(question: string, context: string) {
  const prompt = `
You are the Tactical AI Mine Rescue Command Specialist.
Current Shaft Atmospheric Context:
${context}

Operator Question / Inquiry:
${question}

Provide actionable, safety-first, concise underground mining rescue guidance adhering to standard Mine Safety & Health protocols. Highlight personal protective gear (SCBA / Self-Contained Breathing Apparatus, multi-gas detectors), safe ingress/egress, ventilation fan control, and miner evacuation prioritization. Keep response under 180 words.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite underground mine rescue commander. Be direct, authoritative, and safety-focused.',
      },
    });

    return { answer: response.text || 'Protocol confirmed: Maintain continuous atmospheric monitoring.' };
  } catch (error) {
    console.error('Gemini Rescue Assistant Error:', error);
    return {
      answer:
        'Standard Rescue Protocol: Verify atmosphere with multi-gas detector before entry. Team must wear positive-pressure SCBA. Maintain lifeline communication with surface hoist controller.',
    };
  }
}
