import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, TextInput,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseClusterCode, startLending, stopLending } from '../services/cluster';
import { useChromeInsets } from '../components/Screen';

const TOPIC_KEY = 'dai_cluster_topic';

/**
 * Lend this phone to the desktop miner. The phone does not download a model.
 * It scans the code from Settings → Devices and starts a QVAC RPC worker.
 */
export default function LendScreen({ t }) {
  const chrome = useChromeInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [topic, setTopic] = useState('');
  const [server, setServer] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(TOPIC_KEY).then((saved) => {
      if (saved) setTopic(saved);
    }).catch(() => {});
  }, []);

  async function remember(code) {
    setTopic(code);
    try { await AsyncStorage.setItem(TOPIC_KEY, code); } catch { /* the session still works */ }
  }

  function applyCode(raw) {
    const code = parseClusterCode(raw);
    if (!code) {
      setError(t('settings.lend_bad_code'));
      return false;
    }
    setError(null);
    remember(code);
    return true;
  }

  async function openScanner() {
    setError(null);
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        setError(t('settings.lend_camera'));
        return;
      }
    }
    setScanned(false);
    setCameraVisible(true);
  }

  function onBarcodeScanned({ data }) {
    if (scanned) return;
    setScanned(true);
    setCameraVisible(false);
    applyCode(data);
  }

  async function start() {
    const code = parseClusterCode(topic);
    if (!code) {
      setError(t('settings.lend_bad_code'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (server?.serverId) {
        try { await stopLending(server.serverId); } catch { /* replace it */ }
      }
      const info = await startLending(code);
      setServer(info);
      await remember(code);
    } catch (e) {
      setServer(null);
      setError(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function stop() {
    setBusy(true);
    setError(null);
    try {
      await stopLending(server?.serverId);
      setServer(null);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  const lending = !!server?.serverId;

  return (
    <View>
      <Text style={styles.lead}>{t('settings.lend_desc')}</Text>

      <TextInput
        value={topic}
        onChangeText={(v) => { setTopic(v); setError(null); }}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={t('settings.lend_placeholder')}
        placeholderTextColor="#4b5563"
        style={styles.input}
      />

      {!!server?.url && (
        <Text style={styles.url}>{server.url}</Text>
      )}
      {!!error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.row}>
        <TouchableOpacity style={styles.secondary} onPress={openScanner} disabled={busy}>
          <Text style={styles.secondaryText}>{t('settings.lend_scan')}</Text>
        </TouchableOpacity>
        {lending ? (
          <TouchableOpacity style={styles.stop} onPress={stop} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.stopText}>{t('settings.lend_stop')}</Text>}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primary} onPress={start} disabled={busy}>
            {busy ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryText}>{t('settings.lend_start')}</Text>}
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.note}>{lending ? t('settings.lend_on') : t('settings.lend_off')}</Text>

      <Modal visible={cameraVisible} animationType="slide" onRequestClose={() => setCameraVisible(false)}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : onBarcodeScanned}
          />
          <TouchableOpacity style={[styles.camClose, { bottom: chrome.bottom + 16 }]} onPress={() => setCameraVisible(false)}>
            <Text style={styles.primaryText}>{t('settings.lend_cancel')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  lead: { color: '#9ca3af', fontSize: 14, lineHeight: 20, fontFamily: 'Iceland_400Regular', marginBottom: 14 },
  input: {
    backgroundColor: '#0a0a0a', color: '#e5e7eb', borderWidth: 1, borderColor: '#222',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
    fontFamily: 'Iceland_400Regular',
  },
  url: { color: '#22c55e', marginTop: 10, fontSize: 13, fontFamily: 'Iceland_400Regular' },
  error: { color: '#f87171', marginTop: 10, fontSize: 13, lineHeight: 18, fontFamily: 'Iceland_400Regular' },
  row: { flexDirection: 'row', gap: 10, marginTop: 14 },
  secondary: { flex: 1, borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  secondaryText: { color: '#e5e7eb', fontFamily: 'Iceland_400Regular', fontSize: 15 },
  primary: { flex: 1, backgroundColor: '#22c55e', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  primaryText: { color: '#000', fontFamily: 'Iceland_400Regular', fontSize: 15, fontWeight: '600' },
  stop: { flex: 1, backgroundColor: '#7f1d1d', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  stopText: { color: '#fff', fontFamily: 'Iceland_400Regular', fontSize: 15 },
  note: { color: '#6b7280', marginTop: 14, fontSize: 13, lineHeight: 18, fontFamily: 'Iceland_400Regular' },
  camClose: { position: 'absolute', alignSelf: 'center', backgroundColor: '#22c55e', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 8 },
});
