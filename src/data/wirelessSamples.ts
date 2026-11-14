/**
 * Wireless (VHF Radio System) Periodic Test Sheet Builders & Polan Sample Data
 * Derived verbatim from «تست شیت بیسیم خام.xlsx» and «تست شیت بیسیم پست پلان.xlsx»
 */

import { WirelessRadioColumns, WirelessUnitTestSheet } from '../types';

export const AGL_GUIDE_TEXT =
  'ارتفاع آنتن از زمین (AGL): این فاصله‌ی عمودی بین سطح زمینِ همان محل و مرکز آنتن (Antenna Center) است. مثلاً اگر آنتن روی دکل ۳۰ متری نصب شده باشد، AGL برابر ۳۰ متر است. اگر دکل روی پشت‌بام یک ساختمان باشد، معمولاً ارتفاع ساختمان هم به این عدد اضافه می‌شود.';

export function createEmptyRadioColumns(): WirelessRadioColumns {
  return {
    txPowerW: '',
    reflectedPowerW: '',
    antennaType: '',
    antennaGainDb: '',
    aglMeters: '',
    channelNo: '',
  };
}

export function createDefaultWirelessUnit(
  unitTitle = 'دستگاه بی‌سیم ۱',
  sourceStation = ''
): WirelessUnitTestSheet {
  return {
    id: `wunit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    unitTitle,
    caseNumber: '',
    sourceStation,
    destinationStations: '',
    radioSerialNumber: '',
    brand: '',
    model: '',
    primaryRadio: createEmptyRadioColumns(),
    repeaterRadio: createEmptyRadioColumns(),
    towerType: '',
    towerHeightM: '',
    feederType: '',
    feederLengthM: '',
    connectorsReview: '',
    towerReview: '',
    antennaReview: '',
    dcConverterType: '',
    dcVinV: '',
    dcVoutV: '',
    chargerType: '',
    chargerVoltageV: '',
    batteryType: '',
    batteryAh: '',
    batteryVoltageAfterDischargeV: '',
    outputPowerAfterDischargeW: '',
    notes: '',
  };
}

export function createPolanWirelessSampleUnit(): WirelessUnitTestSheet {
  return {
    id: 'wunit-polan-sample',
    unitTitle: 'بیسیم VHF اصلی پلان (Motorola GM339)',
    caseNumber: '',
    sourceStation: 'پلان',
    destinationStations: 'پیرسهراب - نگور',
    radioSerialNumber: '103TELE768',
    brand: 'Motorola',
    model: 'GM339',
    primaryRadio: {
      txPowerW: '19',
      reflectedPowerW: '0.5',
      antennaType: '4-dipole',
      antennaGainDb: '6',
      aglMeters: '12',
      channelNo: '5',
    },
    repeaterRadio: createEmptyRadioColumns(),
    towerType: 'تیر برق',
    towerHeightM: '12',
    feederType: 'RG-213',
    feederLengthM: '30',
    connectorsReview: '',
    towerReview: '',
    antennaReview: '*',
    dcConverterType: '110/13',
    dcVinV: '113.78',
    dcVoutV: '13.64',
    chargerType: '',
    chargerVoltageV: '',
    batteryType: '',
    batteryAh: '',
    batteryVoltageAfterDischargeV: '',
    outputPowerAfterDischargeW: '',
    notes: AGL_GUIDE_TEXT,
  };
}
