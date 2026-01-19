const BASE_URL = "http://localhost:8082";
export const API_KEY = "treino_master_key_2025";

function normalizeBrazilPhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export async function createInstance(name: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/instance/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: API_KEY,
    } as Record<string, string>,
    body: JSON.stringify({ instanceName: name }),
  });
  if (!res.ok) throw new Error(`Falha ao criar instância: ${res.status}`);
  return res.json();
}

export async function connectInstance(name: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/instance/connect/${encodeURIComponent(name)}`, {
    headers: { apikey: API_KEY } as Record<string, string>,
  });
  if (!res.ok) throw new Error(`Falha ao conectar instância: ${res.status}`);
  const data = await res.json();
  const base64 = data?.qr?.base64 || data?.base64 || data?.qrCode || data?.qrcode || data?.qr;
  if (!base64) throw new Error("QR Code não retornado pela API");
  return base64 as string;
}

export async function sendWorkoutImage(
  instance: string,
  phone: string,
  base64Image: string,
  caption: string
): Promise<unknown> {
  const cleanedPhone = normalizeBrazilPhone(phone);
  const res = await fetch(`${BASE_URL}/message/sendMedia`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: API_KEY,
    } as Record<string, string>,
    body: JSON.stringify({
      instance,
      phone: cleanedPhone,
      media: base64Image,
      caption,
      mimeType: "image/png",
    }),
  });
  if (!res.ok) throw new Error(`Falha ao enviar mídia: ${res.status}`);
  return res.json();
}
