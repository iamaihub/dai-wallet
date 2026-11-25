// Storage keys used across the wallet
export const STORAGE_KEYS = {
  WALLETS: 'dai_wallets_v2',
  SELECTED: 'dai_selected_address_v2',
  NODES: 'dai_nodes_v1',
  ACTIVE_NODE_URL: 'dai_active_node_url_v1',
  LOCAL_TXS: 'dai_local_txs_v2',
  LANG: 'dai_lang_v1',
  DISPLAY_CURRENCY: 'dai_display_currency_v1',
  NODE_URL: 'dai_node_url_v1', // legacy (pre multi-node support)
};

// Default public / bootstrap wallet RPC nodes (used when the user has none configured)
export const DEFAULT_WALLET_NODES = [
  { url: 'https://miner.iamai.kg', name: 'Miner (primary)' },
];

// Bootnodes used for peer discovery via /peers (and fallback /ipfs/latest).
// Order: primary is miner.iamai.kg, then others.
export const DEFAULT_BOOTNODES = [
  'https://miner.iamai.kg',
];

// Same list as the site and the desktop miner. Codes match landing/i18n.js.
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ky', name: 'Kyrgyz', nativeName: 'Кыргызча' },
  { code: 'cn', name: 'Chinese (Simplified)', nativeName: '中文' },
  { code: 'hk', name: 'Cantonese', nativeName: '廣東話' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'arab', name: 'Arabic', nativeName: 'العربية' },
  { code: 'farsi', name: 'Persian', nativeName: 'فارسی' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'dz', name: 'Dzongkha', nativeName: 'རྫོང་ཁ' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'sg', name: 'Singapore English', nativeName: 'English (SG)' },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbekcha' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
];
