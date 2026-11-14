/**
 * Auto-generated Substation & Communications Checklist Dataset
 * Source: REVISION check list DTS-PLC-IPPHONE .1405-06-01.xlsx
 * Total Stations & Control Centers: 107
 */

export type VoltageTier = '400' | '230' | '132' | '63' | 'powerplant' | 'control';
export type ChannelType = 'DTS' | 'PLC' | 'EXTENSION' | 'MOBILE' | 'IP Phone';
export type ChannelHealthStatus = 'ok' | 'down' | 'pending' | 'na';

export interface StationChannelRecord {
  type: ChannelType;
  labelFa: string;
  number: string;
  status: ChannelHealthStatus;
  rawStatus: string;
  note: string;
}

export interface StationCommunication {
  id: string;
  name: string;
  persianName: string;
  dispatchCode: string;
  voltageTier: VoltageTier;
  channels: StationChannelRecord[];
}

export const CHECKLIST_REVISION_DATE = '۱۴۰۵/۰۶/۰۱';
export const CHECKLIST_OPERATOR_PHONES = '۳۱۱۳۷۳۶۱/۶۲/۶۳ - ۳۳۴۲۶۳۲۴';

export const VOLTAGE_TIER_LABELS: Record<VoltageTier, string> = {
  '400': 'پست‌های ۴۰۰ کیلوولت',
  '230': 'پست‌های ۲۳۰ کیلوولت',
  '132': 'پست‌های ۱۳۲ کیلوولت',
  '63': 'پست‌های ۶۳ کیلوولت',
  'powerplant': 'نیروگاه‌ها و واحدهای تولید',
  'control': 'مراکز کنترل و نواحی',
};

export const INITIAL_STATIONS_CHECKLIST: StationCommunication[] = [
  {
    "id": "st-scc",
    "name": "SCC",
    "persianName": "دیسپاچینگ ملی (SCC)",
    "dispatchCode": "",
    "voltageTier": "control",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7006",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "down",
        "rawStatus": "X",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "2185162205 02185162206",
        "status": "na",
        "rawStatus": "",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "",
        "status": "down",
        "rawStatus": "X",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "down",
        "rawStatus": "X",
        "note": ""
      }
    ]
  },
  {
    "id": "st-eaoc",
    "name": "EAOC",
    "persianName": "مرکز کنترل و دیسپاچینگ منطقه (EAOC)",
    "dispatchCode": "",
    "voltageTier": "control",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "160-161-162",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "209-210-610",
        "status": "ok",
        "rawStatus": "√",
        "note": "plc 610 خراب میباشد"
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "31137095-33414155-56-58",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9153033083",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7777",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-zahedan-230",
    "name": "ZAHEDAN-230",
    "persianName": "پست ۲۳۰ کیلوولت زاهدان",
    "dispatchCode": "1001",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7818",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "206",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "31137323",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7799",
        "status": "down",
        "rawStatus": "X",
        "note": ""
      }
    ]
  },
  {
    "id": "st-zahedan-p-p",
    "name": "ZAHEDAN P.P",
    "persianName": "نیروگاه زاهدان",
    "dispatchCode": "1001",
    "voltageTier": "powerplant",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7001",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "230",
        "status": "na",
        "rawStatus": "*",
        "note": "کانفیگ سوئیچ-گیت وی در نیروگاه بعد از برقراری سوئیچ ot برقرار شود.پیگیری"
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "31137367-31137368",
        "status": "ok",
        "rawStatus": "√",
        "note": "شماره دومی 7368 قطع میباشد بعد از نصب گت وی"
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389161",
        "status": "ok",
        "rawStatus": "√",
        "note": "تلفن همراه ندارد -پیگیری(داشتند و ارتباط برقرار بود)"
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "2155",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-zahedan-p-p-g14-g20-g21",
    "name": "ZAHEDAN P.P (G14-G20-G21)",
    "persianName": "نیروگاه زاهدان (واحدهای G14-G20-G21)",
    "dispatchCode": "1001",
    "voltageTier": "powerplant",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7012",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "2154",
        "status": "down",
        "rawStatus": "X",
        "note": "سوئیچ IT ندارد."
      }
    ]
  },
  {
    "id": "st-vahed-4-gazi-zahedan",
    "name": "VAHED 4 GAZI ZAHEDAN",
    "persianName": "واحد ۴ گازی زاهدان",
    "dispatchCode": "1001",
    "voltageTier": "powerplant",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "2069",
        "status": "down",
        "rawStatus": "X",
        "note": "قطع میباشد(ip جدید تعریف نشده است)"
      }
    ]
  },
  {
    "id": "st-loutak-230",
    "name": "LOUTAK-230",
    "persianName": "پست ۲۳۰ کیلوولت لوتک",
    "dispatchCode": "1002",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7828",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "204",
        "status": "ok",
        "rawStatus": "√",
        "note": "صدای مقابل را نداشتند"
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "31137274",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151412076",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7785",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-khash-230",
    "name": "KHASH-230",
    "persianName": "پست ۲۳۰ کیلوولت خاش",
    "dispatchCode": "1003",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7838",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "211",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9105901040",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7784",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-iranshahr-230",
    "name": "IRANSHAHR-230",
    "persianName": "پست ۲۳۰ کیلوولت ایرانشهر",
    "dispatchCode": "1004",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7848",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "300",
        "status": "down",
        "rawStatus": "X",
        "note": "قطع-مرکز تلفن"
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "37225468",
        "status": "down",
        "rawStatus": "X",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151926093",
        "status": "down",
        "rawStatus": "X",
        "note": "تلفن همراه معیوب است"
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7899",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-iranshahr-steam",
    "name": "IRANSHAHR Steam",
    "persianName": "نیروگاه بخار ایرانشهر",
    "dispatchCode": "1004",
    "voltageTier": "powerplant",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7841",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "37228014-37228013",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "2000",
        "status": "na",
        "rawStatus": "*",
        "note": "دوباره چک شود IPشماره ای ثبت نشده"
      }
    ]
  },
  {
    "id": "st-saravan-230",
    "name": "SARAVAN-230",
    "persianName": "پست ۲۳۰ کیلوولت سراوان",
    "dispatchCode": "1005",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7858",
        "status": "ok",
        "rawStatus": "√",
        "note": "کیفیت صدا پایین می باشد"
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "212",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151485247",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-saravan-p-p",
    "name": "SARAVAN P.P",
    "persianName": "نیروگاه سراوان",
    "dispatchCode": "1005",
    "voltageTier": "powerplant",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7851",
        "status": "down",
        "rawStatus": "X",
        "note": "پاسخگو نمی باشد.پیگیری شود نصب گیت وی صورت پذیرد."
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9105901028-09025845466",
        "status": "ok",
        "rawStatus": "√",
        "note": "نیروگاه ارتباط برقرار می باشد."
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-jakiguor-230",
    "name": "JAKIGUOR-230",
    "persianName": "پست ۲۳۰ کیلوولت جکیگور",
    "dispatchCode": "1006",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7868",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "311",
        "status": "down",
        "rawStatus": "X",
        "note": "ندارد-مرکز تلفن"
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389128",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7988",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-naheyeh-markaz-iranshahr",
    "name": "NAHEYEH MARKAZ IRANSHAHR",
    "persianName": "ناحیه مرکز ایرانشهر",
    "dispatchCode": "1006",
    "voltageTier": "control",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "37211062",
        "status": "down",
        "rawStatus": "X",
        "note": "قطع می باشد"
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9153471201",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7800",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-chabahar-230",
    "name": "CHABAHAR-230",
    "persianName": "پست ۲۳۰ کیلوولت چابهار",
    "dispatchCode": "1007",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7968",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "605",
        "status": "ok",
        "rawStatus": "√",
        "note": "از سمت ما مشغول میباشد از اون سمت بوق ازاد دارد"
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389124",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7999",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-chabahar-c-c",
    "name": "CHABAHAR C.C",
    "persianName": "نیروگاه سیکل ترکیبی چابهار",
    "dispatchCode": "1007",
    "voltageTier": "powerplant",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7871",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "35330214",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9356010515-9936557132",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-chabahar-g-i-s",
    "name": "CHABAHAR G I S",
    "persianName": "پست ۲۳۰ کیلوولت GIS چابهار",
    "dispatchCode": "1016",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7879",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "600-601",
        "status": "down",
        "rawStatus": "X",
        "note": "ارتباط ترانک قطع می باشد ِ با زاهدان ارتباط ندارد.با اطراف ارتباط دارد."
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "31137331",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389125",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7998",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-daryayi-63",
    "name": "DARYAYI-63",
    "persianName": "پست ۶۳ کیلوولت دریایی",
    "dispatchCode": "1016",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389117",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-nabovat-400",
    "name": "NABOVAT-400",
    "persianName": "پست ۴۰۰ کیلوولت نبوت",
    "dispatchCode": "1008",
    "voltageTier": "400",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7789",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "205",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "31137275",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7798",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-nikshahr-230",
    "name": "NIKSHAHR-230",
    "persianName": "پست ۲۳۰ کیلوولت نیکشهر",
    "dispatchCode": "1009",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7098",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "608",
        "status": "na",
        "rawStatus": "*",
        "note": "بررسی شود"
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "31137357",
        "status": "down",
        "rawStatus": "X",
        "note": "پاسخگو نبودند"
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389120",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7987",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-polan-230",
    "name": "POLAN-230",
    "persianName": "پست ۲۳۰ کیلوولت پلان",
    "dispatchCode": "1010",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7108",
        "status": "ok",
        "rawStatus": "√",
        "note": "کیفیت صدا پایین می باشد-بررسی گردد."
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "611",
        "status": "down",
        "rawStatus": "X",
        "note": "ندارد-پیگیری شود"
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "31137333",
        "status": "down",
        "rawStatus": "X",
        "note": "پیگیری شود."
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151926971",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7990",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-paroud-230",
    "name": "PAROUD-230",
    "persianName": "پست ۲۳۰ کیلوولت پارود",
    "dispatchCode": "1011",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7158",
        "status": "ok",
        "rawStatus": "√",
        "note": "بوق دارد اما از سمت مقابل بوق اشغال دارد."
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389138",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7891",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-zarabad-230",
    "name": "ZARABAD-230",
    "persianName": "پست ۲۳۰ کیلوولت زرآباد",
    "dispatchCode": "1012",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7928",
        "status": "ok",
        "rawStatus": "√",
        "note": "کیفیت صدا پایین می باشد-بررسی گردد."
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "614",
        "status": "down",
        "rawStatus": "X",
        "note": "قطع-بررسی شود"
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "31137350",
        "status": "down",
        "rawStatus": "X",
        "note": "قطع بررسی شود"
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389118",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7986",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-bampour-230",
    "name": "BAMPOUR-230",
    "persianName": "پست ۲۳۰ کیلوولت بمپور",
    "dispatchCode": "1014",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7948",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "303",
        "status": "down",
        "rawStatus": "X",
        "note": "قطع می باشد"
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151934465",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7898",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-bampour-c-c",
    "name": "BAMPOUR C.C",
    "persianName": "نیروگاه سیکل ترکیبی بمپور",
    "dispatchCode": "1014",
    "voltageTier": "powerplant",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7941",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "302",
        "status": "down",
        "rawStatus": "X",
        "note": "قطع می باشد"
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "37221872",
        "status": "ok",
        "rawStatus": "√",
        "note": "صدای مقابل ضعیف بود"
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-machkour-230",
    "name": "MACHKOUR-230",
    "persianName": "پست ۲۳۰ کیلوولت ماشکید/مچکور",
    "dispatchCode": "1015",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151470178",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7892",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-sefid-abeh-400",
    "name": "SEFID ABEH-400",
    "persianName": "پست ۴۰۰ کیلوولت سفیدآبه",
    "dispatchCode": "1017",
    "voltageTier": "400",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7179",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "203",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "31137273",
        "status": "ok",
        "rawStatus": "√",
        "note": "نویز دارد"
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9153405146",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7791",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-espakeh-230",
    "name": "ESPAKEH-230",
    "persianName": "پست ۲۳۰ کیلوولت اسپکه",
    "dispatchCode": "1018",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7988",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "314",
        "status": "down",
        "rawStatus": "X",
        "note": "قطع"
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389141",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7884",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-tal-siah-230",
    "name": "TAL SIAH-230",
    "persianName": "پست ۲۳۰ کیلوولت تل‌سیاه",
    "dispatchCode": "1019",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7198",
        "status": "ok",
        "rawStatus": "√",
        "note": "نویز دارد"
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "213",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "31137319",
        "status": "down",
        "rawStatus": "X",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389129",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7792",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-golmorti-230",
    "name": "GOLMORTI-230",
    "persianName": "پست ۲۳۰ کیلوولت گلمورتی",
    "dispatchCode": "1020",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7208",
        "status": "ok",
        "rawStatus": "√",
        "note": "کیفیت صدا پایین می باشد-بررسی گردد."
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9105901048",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7886",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-ashar-230",
    "name": "ASHAR-230",
    "persianName": "پست ۲۳۰ کیلوولت آشار",
    "dispatchCode": "1021",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7028",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "312",
        "status": "down",
        "rawStatus": "X",
        "note": "قطع میباشد"
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389140-09025845469",
        "status": "ok",
        "rawStatus": "√",
        "note": "خط همراه اول آنتن ندارد خط ایرانسل وصل میباشد"
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7889",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-petroshimi-gis",
    "name": "PETROSHIMI-GIS",
    "persianName": "پست GIS پتروشیمی",
    "dispatchCode": "",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7697",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389124",
        "status": "ok",
        "rawStatus": "√",
        "note": "شماره برای چابهار230 می باشد"
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "2067",
        "status": "na",
        "rawStatus": "*",
        "note": "مکران AIS 7996/ 7997 GISمکران"
      }
    ]
  },
  {
    "id": "st-adimi-400",
    "name": "ADIMI-400",
    "persianName": "پست ۴۰۰ کیلوولت ادیمی",
    "dispatchCode": "1022",
    "voltageTier": "400",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7229",
        "status": "down",
        "rawStatus": "X",
        "note": "نصب گیت وی"
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151927445",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7790",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-adimi-63",
    "name": "ADIMI-63",
    "persianName": "پست ۶۳ کیلوولت ادیمی",
    "dispatchCode": "1022",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389133",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-hirmand-230",
    "name": "HIRMAND-230",
    "persianName": "پست ۲۳۰ کیلوولت هیرمند",
    "dispatchCode": "1023",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "",
        "status": "down",
        "rawStatus": "X",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151943858",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7789",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-parvaz-230",
    "name": "PARVAZ-230",
    "persianName": "پست ۲۳۰ کیلوولت پرواز",
    "dispatchCode": "1024",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7248",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155248290",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7797",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-pahreh-230",
    "name": "PAHREH-230",
    "persianName": "پست ۲۳۰ کیلوولت پهره",
    "dispatchCode": "1025",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7258",
        "status": "down",
        "rawStatus": "X",
        "note": "نصب تلفن در پست"
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389215",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7896",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-fanouj-230",
    "name": "FANOUJ-230",
    "persianName": "پست ۲۳۰ کیلوولت فنوج",
    "dispatchCode": "1026",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7010",
        "status": "down",
        "rawStatus": "X",
        "note": "فقط بوق دارد-نصب تلفن"
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9105901016-9025845470",
        "status": "down",
        "rawStatus": "X",
        "note": "خط 09105901016 قطع میباشد و شماره 09025845470 فعال میباشد"
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7888",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-dashtak-230",
    "name": "DASHTAK-230",
    "persianName": "پست ۲۳۰ کیلوولت دشتک",
    "dispatchCode": "1027",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7003",
        "status": "down",
        "rawStatus": "X",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151926103",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-mirjaveh-230",
    "name": "MIRJAVEH-230",
    "persianName": "پست ۲۳۰ کیلوولت میرجاوه",
    "dispatchCode": "1028",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7288",
        "status": "ok",
        "rawStatus": "√",
        "note": "کیفیت صدا پایین می باشد.پیگیری"
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389216",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7773",
        "status": "down",
        "rawStatus": "X",
        "note": ""
      }
    ]
  },
  {
    "id": "st-petroshimi-makoran-230",
    "name": "PETROSHIMI-MAKORAN-230",
    "persianName": "پست ۲۳۰ کیلوولت پتروشیمی مکران",
    "dispatchCode": "1029",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7691",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-sardargan-230",
    "name": "Sardargan 230",
    "persianName": "پست ۲۳۰ کیلوولت سردارگان",
    "dispatchCode": "1030",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7009",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151926975",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7894",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-konarak-p-p",
    "name": "KONARAK P.P",
    "persianName": "نیروگاه کنارک",
    "dispatchCode": "1031",
    "voltageTier": "powerplant",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7991",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "606",
        "status": "down",
        "rawStatus": "X",
        "note": "قطع"
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "35382789",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389256",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7993",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-neginmakoran-230",
    "name": "NEGINMAKORAN-230",
    "persianName": "پست ۲۳۰ کیلوولت نگین مکران",
    "dispatchCode": "1032",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7698",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151926095",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7996",
        "status": "ok",
        "rawStatus": "√",
        "note": "مکران AIS 7996/ 7997 GISمکران"
      }
    ]
  },
  {
    "id": "st-mehrestan-230",
    "name": "MEHRESTAN-230",
    "persianName": "پست ۲۳۰ کیلوولت مهرستان",
    "dispatchCode": "1034",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7011",
        "status": "down",
        "rawStatus": "X",
        "note": "پاسخگو نبودند. قطع"
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": "به دلیل سرقت کابل قطع میباشد"
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9912986599",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-sarkor-230",
    "name": "Sarkor-230",
    "persianName": "پست ۲۳۰ کیلوولت سرکور",
    "dispatchCode": "1034",
    "voltageTier": "230",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7005",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151926094",
        "status": "down",
        "rawStatus": "X",
        "note": "قطع مشکل از گوشی موبایل"
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7893",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-milnader-400",
    "name": "Milnader 400",
    "persianName": "پست ۴۰۰ کیلوولت میل‌نادر",
    "dispatchCode": "1036",
    "voltageTier": "400",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7008",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7778",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-pishin-132",
    "name": "PISHIN-132",
    "persianName": "پست ۱۳۲ کیلوولت پیشین",
    "dispatchCode": "1033",
    "voltageTier": "132",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7337",
        "status": "ok",
        "rawStatus": "√",
        "note": "کیفیت صدا پایین بود نویز داشت"
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-koteij-132",
    "name": "KOTEIJ-132",
    "persianName": "پست ۱۳۲ کیلوولت کتیج",
    "dispatchCode": "088",
    "voltageTier": "132",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "7007",
        "status": "down",
        "rawStatus": "X",
        "note": "قطع"
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9105901027",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7887",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-it",
    "name": "IT",
    "persianName": "واحد فناوری اطلاعات (IT)",
    "dispatchCode": "",
    "voltageTier": "control",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "31137100",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151962993",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7265",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-naheyeh-shomal",
    "name": "NAHEYEH SHOMAL",
    "persianName": "ناحیه شمال",
    "dispatchCode": "",
    "voltageTier": "control",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "33513823-24",
        "status": "ok",
        "rawStatus": "√",
        "note": "پاسخگو نبودند"
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "2090",
        "status": "down",
        "rawStatus": "X",
        "note": ""
      }
    ]
  },
  {
    "id": "st-gharb-63",
    "name": "GHARB-63",
    "persianName": "پست ۶۳ کیلوولت غرب زاهدان",
    "dispatchCode": "010",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "33513822",
        "status": "down",
        "rawStatus": "X",
        "note": "کابل سرقت رفته است"
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151926096",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7795",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-zabol-1-63",
    "name": "ZABOL 1-63",
    "persianName": "پست ۶۳ کیلوولت زابل ۱",
    "dispatchCode": "011",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "32292533",
        "status": "down",
        "rawStatus": "X",
        "note": "به دلیل سرقت کابل قطع میباشد"
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155439102",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7788",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-sirkan-63",
    "name": "SIRKAN-63",
    "persianName": "پست ۶۳ کیلوولت سیرکان",
    "dispatchCode": "012",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151926109",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-khash-1-63",
    "name": "KHASH 1-63",
    "persianName": "پست ۶۳ کیلوولت خاش ۱",
    "dispatchCode": "013",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "33720350",
        "status": "na",
        "rawStatus": "*",
        "note": "کابل سرقت رفته است"
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151927437",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7783",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-goharkouh-63",
    "name": "GOHARKOUH-63",
    "persianName": "پست ۶۳ کیلوولت گوهرکوه",
    "dispatchCode": "014",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "33754244",
        "status": "na",
        "rawStatus": "*",
        "note": "کابل سرقت رفته است"
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151245123",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7771",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-jalgh-63",
    "name": "JALGH-63",
    "persianName": "پست ۶۳ کیلوولت جالق",
    "dispatchCode": "015",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151926088",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-gousht-63",
    "name": "GOUSHT-63",
    "persianName": "پست ۶۳ کیلوولت گشت",
    "dispatchCode": "016",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "37664141",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151926105",
        "status": "ok",
        "rawStatus": "√",
        "note": "کیفیت صدا پایین می باشد.باتری خراب میباشد و بلند گوی گوشی هم مشکل دارد ."
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-mohammad-abad-63",
    "name": "MOHAMMAD ABAD-63",
    "persianName": "پست ۶۳ کیلوولت محمدآباد",
    "dispatchCode": "017",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "37342098",
        "status": "down",
        "rawStatus": "X",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389159",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7883",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-chanf-63",
    "name": "CHANF-63",
    "persianName": "پست ۶۳ کیلوولت چانف",
    "dispatchCode": "018",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151934463",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-dalgan-63",
    "name": "DALGAN-63",
    "persianName": "پست ۶۳ کیلوولت دلگان",
    "dispatchCode": "020",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "37332456",
        "status": "down",
        "rawStatus": "X",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389154-09025845468",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7885",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-maskoutan-63",
    "name": "MASKOUTAN-63",
    "persianName": "پست ۶۳ کیلوولت مسکوتان",
    "dispatchCode": "021",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389139",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-jolgeh-63",
    "name": "JOLGEH-63",
    "persianName": "پست ۶۳ کیلوولت جلگه",
    "dispatchCode": "021",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151926091",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-negor-63",
    "name": "NEGOR-63",
    "persianName": "پست ۶۳ کیلوولت نگور",
    "dispatchCode": "023",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389127",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7989",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-pasabandar-63",
    "name": "PASABANDAR-63",
    "persianName": "پست ۶۳ کیلوولت پسابندر",
    "dispatchCode": "024",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151926092",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-makoran-63",
    "name": "MAKORAN-63",
    "persianName": "پست ۶۳ کیلوولت مکران",
    "dispatchCode": "025",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "35333862",
        "status": "down",
        "rawStatus": "X",
        "note": "کابل سرقت رفته است"
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389115",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7991",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-golshahr-63",
    "name": "GOLSHAHR-63",
    "persianName": "پست ۶۳ کیلوولت گلشهر",
    "dispatchCode": "026",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "35330790",
        "status": "down",
        "rawStatus": "X",
        "note": "قطع می باشد"
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151412077",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7992",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-havayi-63",
    "name": "HAVAYI-63",
    "persianName": "پست ۶۳ کیلوولت هوایی",
    "dispatchCode": "027",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389116",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7995",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-mirjaveh-63",
    "name": "MIRJAVEH-63",
    "persianName": "پست ۶۳ کیلوولت میرجاوه",
    "dispatchCode": "033",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "33582554",
        "status": "down",
        "rawStatus": "X",
        "note": "به دلیل سرقت کابل قطع میباشد"
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389216",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7774",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-rah-ahan-63",
    "name": "RAH AHAN-63",
    "persianName": "پست ۶۳ کیلوولت راه‌آهن",
    "dispatchCode": "034",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "33229183",
        "status": "down",
        "rawStatus": "X",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155439103",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7794",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-saravan-1-63",
    "name": "SARAVAN 1-63",
    "persianName": "پست ۶۳ کیلوولت سراوان ۱",
    "dispatchCode": "035",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "37630026",
        "status": "down",
        "rawStatus": "X",
        "note": "به دلیل سرقت کابل قطع میباشد"
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389157",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7775",
        "status": "down",
        "rawStatus": "X",
        "note": ""
      }
    ]
  },
  {
    "id": "st-zahak-63",
    "name": "ZAHAK-63",
    "persianName": "پست ۶۳ کیلوولت زهک",
    "dispatchCode": "037",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151927085",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7786",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-sarbaz-63",
    "name": "SARBAZ-63",
    "persianName": "پست ۶۳ کیلوولت سرباز",
    "dispatchCode": "038",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "37312446",
        "status": "down",
        "rawStatus": "X",
        "note": "قطع میباشد -سرقت کابل"
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389137",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7890",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-ghasr-ghand-63",
    "name": "GHASR GHAND-63",
    "persianName": "پست ۶۳ کیلوولت قصرقند",
    "dispatchCode": "041",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389121",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-lashar-63",
    "name": "LASHAR-63",
    "persianName": "پست ۶۳ کیلوولت لاشار",
    "dispatchCode": "042",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151926972",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-emam-ali-63",
    "name": "EMAM ALI-63",
    "persianName": "پست ۶۳ کیلوولت امام علی (ع)",
    "dispatchCode": "043",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "33295742",
        "status": "down",
        "rawStatus": "X",
        "note": "کابل سرقت رفته است"
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9105901049",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7793",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-shirgovaz-63",
    "name": "SHIRGOVAZ-63",
    "persianName": "پست ۶۳ کیلوولت شیرگواز",
    "dispatchCode": "044",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151943860",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-damen-63",
    "name": "DAMEN-63",
    "persianName": "پست ۶۳ کیلوولت دامن",
    "dispatchCode": "045",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389135",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7895",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-rahmat-abad-63",
    "name": "RAHMAT ABAD-63",
    "persianName": "پست ۶۳ کیلوولت رحمت‌آباد",
    "dispatchCode": "046",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389134",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-bent-63",
    "name": "BENT-63",
    "persianName": "پست ۶۳ کیلوولت بنت",
    "dispatchCode": "047",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389122",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-pirsohrab-63",
    "name": "PIRSOHRAB-63",
    "persianName": "پست ۶۳ کیلوولت پیرسهراب",
    "dispatchCode": "049",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9013477332",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-shandol-63",
    "name": "SHANDOL-63",
    "persianName": "پست ۶۳ کیلوولت شندول",
    "dispatchCode": "050",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389131",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7781",
        "status": "down",
        "rawStatus": "X",
        "note": "قطع میباشد-پیگیری از it"
      }
    ]
  },
  {
    "id": "st-jabr-abad-63",
    "name": "JABR ABAD-63",
    "persianName": "پست ۶۳ کیلوولت جبرآباد",
    "dispatchCode": "051",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9105901047",
        "status": "ok",
        "rawStatus": "√",
        "note": "خاموش"
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-shohada-63",
    "name": "SHOHADA -63",
    "persianName": "پست ۶۳ کیلوولت شهدا",
    "dispatchCode": "053",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151412078",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7796",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-tis-63",
    "name": "TIS-63",
    "persianName": "پست ۶۳ کیلوولت تیس",
    "dispatchCode": "054",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389126",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7994",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-kahir-63",
    "name": "KAHIR-63",
    "persianName": "پست ۶۳ کیلوولت کهیر",
    "dispatchCode": "055",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151926970",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-sardargan-63",
    "name": "SARDARGAN-63",
    "persianName": "پست ۶۳ کیلوولت سردارگان",
    "dispatchCode": "056",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389136",
        "status": "down",
        "rawStatus": "X",
        "note": "خاموش میباشد"
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-milak-63",
    "name": "MILAk-63",
    "persianName": "پست ۶۳ کیلوولت میلک",
    "dispatchCode": "058",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "32613990",
        "status": "na",
        "rawStatus": "*",
        "note": "کابل سرقت رفته است"
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155439101",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7776",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-chahkichi-63",
    "name": "CHAHKICHI-63",
    "persianName": "پست ۶۳ کیلوولت چاه‌کیچی",
    "dispatchCode": "059",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151926089",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-zabol-2-63-hamoon",
    "name": "ZABOL 2-63(HAMOON)",
    "persianName": "پست ۶۳ کیلوولت زابل ۲ (هامون)",
    "dispatchCode": "060",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389132-9029441069",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7787",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-khatam-63",
    "name": "KHATAM -63",
    "persianName": "پست ۶۳ کیلوولت خاتم",
    "dispatchCode": "061",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "37212129",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151926104",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7897",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-chahan-63",
    "name": "CHAHAN-63",
    "persianName": "پست ۶۳ کیلوولت چاهان",
    "dispatchCode": "062",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389123",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-chehel-koreh-63",
    "name": "CHEHEL KOREH-63",
    "persianName": "پست ۶۳ کیلوولت چهل‌کره",
    "dispatchCode": "069",
    "voltageTier": "63",
    "channels": [
      {
        "type": "DTS",
        "labelFa": "تلفن دیسپاچینگ (DTS)",
        "number": "030",
        "status": "down",
        "rawStatus": "X",
        "note": ""
      },
      {
        "type": "PLC",
        "labelFa": "خط کاریر (PLC)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "33426328",
        "status": "down",
        "rawStatus": "X",
        "note": "قطع-پیگیری شود"
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-kourin-63",
    "name": "KOURIN-63",
    "persianName": "پست ۶۳ کیلوولت کورین",
    "dispatchCode": "074",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9105901046",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-ramin-63",
    "name": "RAMIN-63",
    "persianName": "پست ۶۳ کیلوولت رامین",
    "dispatchCode": "076",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9105901045",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-eslam-abad-63",
    "name": "ESLAM ABAD-63",
    "persianName": "پست ۶۳ کیلوولت اسلام‌آباد",
    "dispatchCode": "080",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151927090",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7772",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-behesht-abad-63",
    "name": "BEHESHT ABAD-63",
    "persianName": "پست ۶۳ کیلوولت بهشت‌آباد",
    "dispatchCode": "081",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151927435",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-dahak-63",
    "name": "DAHAK-63",
    "persianName": "پست ۶۳ کیلوولت دهک",
    "dispatchCode": "082",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389218",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-jazinak-63",
    "name": "JAZINAK-63",
    "persianName": "پست ۶۳ کیلوولت جزینک",
    "dispatchCode": "083",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151934462",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7782",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      }
    ]
  },
  {
    "id": "st-margan-63",
    "name": "MARGAN-63",
    "persianName": "پست ۶۳ کیلوولت مارگان",
    "dispatchCode": "084",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151934464",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7780",
        "status": "down",
        "rawStatus": "X",
        "note": "قطع میباشد-پیگیری از it"
      }
    ]
  },
  {
    "id": "st-bazman-63",
    "name": "BAZMAN-63",
    "persianName": "پست ۶۳ کیلوولت بزمان",
    "dispatchCode": "085",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151926974",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-chah-ali-63",
    "name": "CHAH ALI -63",
    "persianName": "پست ۶۳ کیلوولت چاه‌علی",
    "dispatchCode": "086",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9153405148",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-mil-nader-63",
    "name": "MIL NADER-63",
    "persianName": "پست ۶۳ کیلوولت میل‌نادر",
    "dispatchCode": "087",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9105901036",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7779",
        "status": "down",
        "rawStatus": "X",
        "note": ""
      }
    ]
  },
  {
    "id": "st-fanouj-63",
    "name": "FANOUJ-63",
    "persianName": "پست ۶۳ کیلوولت فنوج",
    "dispatchCode": "",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9155389142",
        "status": "down",
        "rawStatus": "X",
        "note": "خاموش میباشد-آیا اپراتور جداگانه دارد یا خیر از پست 230 فنوج سوال گردید.بله اما کنار هم هستند"
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-boostannamaz-63",
    "name": "BOOSTANNAMAZ-63",
    "persianName": "پست ۶۳ کیلوولت بوستان‌نماز",
    "dispatchCode": "089",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9151926107",
        "status": "down",
        "rawStatus": "X",
        "note": "قطع"
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  },
  {
    "id": "st-naheyeh-jonob-chabahar",
    "name": "NAHEYEH JONOB CHABAHAR",
    "persianName": "ناحیه جنوب چابهار",
    "dispatchCode": "",
    "voltageTier": "control",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "7902",
        "status": "ok",
        "rawStatus": "√",
        "note": "پاسخگو نمی باشد"
      }
    ]
  },
  {
    "id": "st-nosratabad-63",
    "name": "NOSRATABAD-63",
    "persianName": "پست ۶۳ کیلوولت نصرت‌آباد",
    "dispatchCode": "090",
    "voltageTier": "63",
    "channels": [
      {
        "type": "EXTENSION",
        "labelFa": "تلفن داخلی / شهری",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      },
      {
        "type": "MOBILE",
        "labelFa": "تلفن همراه عملیاتی",
        "number": "9912986620",
        "status": "ok",
        "rawStatus": "√",
        "note": ""
      },
      {
        "type": "IP Phone",
        "labelFa": "تلفن تحت شبکه (IP Phone)",
        "number": "",
        "status": "na",
        "rawStatus": "*",
        "note": ""
      }
    ]
  }
];
