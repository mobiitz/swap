import { APP_CODE, PARTNER_FEE, WIDGET_THEME } from './widgetConfig'

export const SEPOLIA_CHAIN_ID = 11155111

export function getBaseTestWidgetParams(width = '420px', height = '640px') {
  return {
    appCode: APP_CODE,
    width,
    height,
    chainId: SEPOLIA_CHAIN_ID,
    standaloneMode: true,
    sell: { asset: 'USDC' },
    buy: { asset: 'WETH' },
    theme: WIDGET_THEME,
    partnerFee: PARTNER_FEE,
  }
}
