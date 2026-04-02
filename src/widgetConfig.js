export const MBTC_TOKEN = {
  chainId: 1,
  address: '0x3898257dD2Cd6d2A3b6e3435f73568A725262b9B',
  name: 'MAGA Bitcoin',
  symbol: 'MBTC',
  decimals: 18,
}

export const APP_CODE = 'mbtc-swap'

export const PARTNER_FEE = {
  bps: 10,
  recipient: '0xE7E2775f96F282a97Ba0Dbc2Bc2948bA16a701D0',
}

export const WIDGET_THEME = {
  baseTheme: 'dark',
  primary: '#00ff85',
  background: '#0a0f14',
  paper: '#101820',
  text: '#f5fff8',
  warning: '#ffb700',
  alert: '#b8ffb2',
  success: '#19ff64',
}

export function getBaseWidgetParams(width = '420px', height = '640px') {
  return {
    appCode: APP_CODE,
    width,
    height,
    chainId: 1,
    standaloneMode: true,
    sell: { asset: 'USDC' },
    buy: { asset: MBTC_TOKEN.address },
    theme: WIDGET_THEME,
    partnerFee: PARTNER_FEE,
    customTokens: [MBTC_TOKEN],
  }
}
