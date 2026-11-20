// Lend this phone's memory to a desktop miner.
//
// The desktop shows a QR of `dai-cluster:<topic>`. This phone starts a QVAC
// RPC worker on that topic and announces its Wi-Fi address. The weights stay
// on the desktop. The phone only lends memory and compute, and only while
// both devices are on the same private IPv4 network.

const PREFIX = 'dai-cluster:';

export function parseClusterCode(raw) {
  let text = String(raw || '').trim();
  if (!text) return null;
  if (text.startsWith(PREFIX)) text = text.slice(PREFIX.length).trim();
  if (text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed.topic === 'string') text = parsed.topic.trim();
    } catch {
      return null;
    }
  }
  if (!/^[\w.-]{8,128}$/.test(text)) return null;
  return text;
}

// QVAC only advertises a worker on a concrete private IPv4 (10/8, 172.16/12,
// 192.168/16). The SDK picks the accelerators; we only supply the address.
async function lanHost() {
  try {
    const Network = await import('expo-network');
    const ip = String(await Network.getIpAddressAsync() || '').trim();
    if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) return ip;
  } catch { /* startRpcServer reports a missing private host itself */ }
  return '';
}

export async function startLending(topic) {
  const code = parseClusterCode(topic);
  if (!code) throw new Error('That code is not a lend code.');
  const sdk = await import('@qvac/sdk');
  const host = await lanHost();
  const info = await sdk.startRpcServer({
    ...(host ? { host } : {}),
    allowNonLoopbackHost: true,
    discoveryTopic: code,
  });
  return { topic: code, serverId: info.serverId, url: info.url || '' };
}

export async function stopLending(serverId) {
  if (!serverId) return;
  const sdk = await import('@qvac/sdk');
  await sdk.stopRpcServer({ serverId });
}
