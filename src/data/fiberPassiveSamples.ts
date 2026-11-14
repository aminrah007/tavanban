/**
 * Passive Optical Fiber Periodic Test Sheet Builders & Fanooj 230 Reference Sample
 * Derived verbatim from the attached Excel test sheet templates.
 */

import { FiberCoreRow, FiberPhysicalChecklist, FiberRouteTestSheet } from '../types';

export function createEmptyPhysicalChecklist(): FiberPhysicalChecklist {
  return {
    fiberRoomStatus: 'سالم',
    floorLayoutMatch: 'سالم',
    opgwAndDuctHealth: 'سالم',
    gantryJointBox: 'سالم',
    clampsAndLoops: '',
    labels: 'سالم',
    pigtails: '',
    patchCords: 'سالم',
    remarks: '',
  };
}

export function createFiberCoreRows(count = 24, defaultSection = '1', defaultDestination = ''): FiberCoreRow[] {
  return Array.from({ length: count }, (_, idx) => {
    const num = idx + 1;
    return {
      id: `core-${Date.now()}-${num}-${Math.random().toString(36).slice(2, 6)}`,
      rowNumber: num,
      sectionNumber: defaultSection,
      pigtailNumber: String(num),
      destination: defaultDestination,
      activeEquipment: '',
      coreStatus: '',
      attenuationDb: '',
      distanceKm: '',
      notes: '',
    };
  });
}

export function createDefaultFiberRoute(
  routeTitle = 'مسیر ۱',
  coreCount = 24,
  sourceStation = ''
): FiberRouteTestSheet {
  return {
    id: `route-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    routeTitle,
    sourceStation,
    destinationStation: '',
    lineLengthText: '',
    outdoorCableType: coreCount === 6 ? '6 Core' : 'OPGW 24 Core',
    indoorCableType: coreCount === 6 ? 'کانالی NZ OPUC 2*4' : 'کانالی NZ OPUC 4*6',
    ocdfType: 'پچ پنل',
    odfConnectorType: 'SC',
    pmDateJalali: '۱۴۰۵/۰۷/۲۵',
    physical: createEmptyPhysicalChecklist(),
    cores: createFiberCoreRows(coreCount, '1', ''),
  };
}

// Exact 4-route Fanooj 230 sample extracted from the user's filled Excel workbook
export function createFanooj230SampleRoutes(): FiberRouteTestSheet[] {
  const buildRow = (
    rowNumber: number,
    sectionNumber: string,
    pigtailNumber: string,
    destination: string,
    activeEquipment: string,
    coreStatus: FiberCoreRow['coreStatus'],
    attenuationDb: string,
    distanceKm: string,
    notes: string
  ): FiberCoreRow => ({
    id: `fanooj-${sectionNumber}-${rowNumber}-${Math.random().toString(36).slice(2, 6)}`,
    rowNumber,
    sectionNumber,
    pigtailNumber,
    destination,
    activeEquipment,
    coreStatus,
    attenuationDb,
    distanceKm,
    notes,
  });

  const basePhysical: FiberPhysicalChecklist = {
    fiberRoomStatus: 'سالم',
    floorLayoutMatch: 'سالم',
    opgwAndDuctHealth: 'سالم',
    gantryJointBox: 'سالم',
    clampsAndLoops: '',
    labels: 'سالم',
    pigtails: '',
    patchCords: 'سالم',
    remarks: '',
  };

  return [
    {
      id: 'route-fanooj-katij',
      routeTitle: 'کتیج',
      sourceStation: 'کتیج 132',
      destinationStation: 'فنوج 230',
      lineLengthText: '54',
      outdoorCableType: 'OPGW 24 Core',
      indoorCableType: 'کانالی NZ OPUC 4*6',
      ocdfType: 'پچ پنل',
      odfConnectorType: 'SC',
      pmDateJalali: '۱۴۰۵/۰۷/۲۵',
      physical: { ...basePhysical },
      cores: [
        buildRow(1, '1', '1', 'کتیج', '', 'تاریک', '9.7', '54.34', 'نتایج OTDR به پیوست'),
        buildRow(2, '1', '2', 'کتیج', '', 'تاریک', '11.21', '54.34', 'نتایج OTDR به پیوست'),
        buildRow(3, '1', '3', 'کتیج', '', 'تاریک', '11.04', '54.34', 'نتایج OTDR به پیوست'),
        buildRow(4, '1', '4', 'کتیج', '', 'تاریک', '9.88', '54.35', 'نتایج OTDR به پیوست'),
        buildRow(5, '1', '5', 'کتیج', '', 'تاریک', '11.06', '54.35', 'نتایج OTDR به پیوست'),
        buildRow(6, '1', '6', 'کتیج', '', 'تاریک', '12.99', '54.34', 'نتایج OTDR به پیوست'),
        buildRow(7, '1', '7', 'کتیج', '', 'تاریک', '-', '54.34', 'نتایج OTDR به پیوست'),
        buildRow(8, '1', '8', 'کتیج', '', 'تاریک', '8.57', '54.34', 'نتایج OTDR به پیوست'),
        buildRow(9, '1', '9', 'کتیج', '', 'تاریک', '11.46', '54.35', 'نتایج OTDR به پیوست'),
        buildRow(10, '1', '10', 'کتیج', '', 'تاریک', '6.78', '54.34', 'نتایج OTDR به پیوست'),
        buildRow(11, '1', '11', 'کتیج', '', 'تاریک', '11.32', '54.34', 'نتایج OTDR به پیوست'),
        buildRow(12, '1', '12', 'کتیج', '', 'تاریک', '9.23', '54.35', 'نتایج OTDR به پیوست'),
        buildRow(13, '1', '13', 'کتیج', '', 'تاریک', '11.26', '54.35', 'نتایج OTDR به پیوست'),
        buildRow(14, '1', '14', 'کتیج', '', 'تاریک', '11.34', '54.35', 'نتایج OTDR به پیوست'),
        buildRow(15, '1', '15', 'کتیج', '', 'قطع', '0', '14.37', 'نتایج OTDR به پیوست (در 14.37 کیلومتری قطع میباشد)'),
        buildRow(16, '1', '16', 'کتیج', '', 'تاریک', '11.24', '54.35', 'نتایج OTDR به پیوست'),
        buildRow(17, '1', '17', 'کتیج', '', 'تاریک', '11.38', '54.35', 'نتایج OTDR به پیوست'),
        buildRow(18, '1', '18', 'کتیج', '', 'تاریک', '11.3', '54.35', 'نتایج OTDR به پیوست'),
        buildRow(19, '1', '19', 'کتیج', '', 'تاریک', '11.23', '54.35', 'نتایج OTDR به پیوست'),
        buildRow(20, '1', '20', 'کتیج', '', 'تاریک', '11.28', '54.35', 'نتایج OTDR به پیوست'),
        buildRow(21, '1', '21', 'کتیج', 'SW OT 3560', 'زیربار', '', '', 'به علت زیر بار بودن تست نشد'),
        buildRow(22, '1', '22', 'کتیج', 'SW OT 3560', 'زیربار', '', '', 'به علت زیر بار بودن تست نشد'),
        buildRow(23, '1', '23', 'کتیج', 'SW it 3560', 'زیربار', '', '', 'به علت زیر بار بودن تست نشد'),
        buildRow(24, '1', '24', 'کتیج', 'SW it 3560', 'زیربار', '', '', 'به علت زیر بار بودن تست نشد'),
      ],
    },
    {
      id: 'route-fanooj-nikshahr',
      routeTitle: 'نیکشهر - اسپکه - بمپور',
      sourceStation: 'فنوج 230',
      destinationStation: 'اسپکه',
      lineLengthText: '93',
      outdoorCableType: 'OPGW 24 Core',
      indoorCableType: 'کانالی NZ OPUC 4*6',
      ocdfType: 'پچ پنل',
      odfConnectorType: 'SC',
      pmDateJalali: '۱۴۰۵/۰۷/۲۵',
      physical: { ...basePhysical },
      cores: [
        buildRow(1, '2', '1', 'Nikshahr', 'CGR', 'زیربار', '', '', 'به علت زیر بار بودن تست نشد'),
        buildRow(2, '2', '2', 'Nikshahr', 'CGR', 'زیربار', '', '', 'به علت زیر بار بودن تست نشد'),
        buildRow(3, '2', '3', 'Nikshahr', '', 'تاریک', '22', '93.44', 'نتایج OTDR به پیوست'),
        buildRow(4, '2', '4', 'Nikshahr', '', 'تاریک', '21', '93.45', 'نتایج OTDR به پیوست'),
        buildRow(5, '2', '5', 'Nikshahr', 'SW IT', 'زیربار', '', '', 'به علت زیر بار بودن تست نشد'),
        buildRow(6, '2', '6', 'Nikshahr', 'SW IT', 'زیربار', '', '', 'به علت زیر بار بودن تست نشد'),
        buildRow(7, '2', '7', 'Nikshahr', 'SW OT', 'زیربار', '', '', 'به علت زیر بار بودن تست نشد'),
        buildRow(8, '2', '8', 'Nikshahr', 'SW OT', 'زیربار', '', '', 'به علت زیر بار بودن تست نشد'),
        buildRow(9, '2', '9', 'Nikshahr', '', 'تاریک', '13', '93.28', 'نتایج OTDR به پیوست'),
        buildRow(10, '2', '10', 'Nikshahr', '', 'تاریک', '12', '93.25', 'نتایج OTDR به پیوست'),
        buildRow(11, '2', '11', 'Nikshahr', '', 'قطع', '', '19.4', 'نتایج OTDR به پیوست (در 19.4 کیلومتری قطع میباشد)'),
        buildRow(12, '2', '12', 'Nikshahr', '', 'تاریک', '15.61', '93.26', 'نتایج OTDR به پیوست'),
        buildRow(13, '2', '13', 'bampor', '', 'تاریک', '21.31', '152.06', 'نتایج OTDR به پیوست'),
        buildRow(14, '2', '14', 'bampor', '', 'تاریک', '23.51', '152.22', 'نتایج OTDR به پیوست'),
        buildRow(15, '2', '15', 'bampor', '', 'تاریک', '21.22', '152.04', 'نتایج OTDR به پیوست'),
        buildRow(16, '2', '16', 'bampor', '', 'تاریک', '21.69', '151.95', 'نتایج OTDR به پیوست'),
        buildRow(17, '2', '17', 'bampor', '', 'تاریک', '21.98', '152.06', 'نتایج OTDR به پیوست'),
        buildRow(18, '2', '18', 'bampor', '', 'تاریک', '23.24', '152.14', 'نتایج OTDR به پیوست'),
        buildRow(19, '2', '19', 'اسپکه', 'CGR', 'زیربار', '', '', 'به علت زیر بار بودن تست نشد'),
        buildRow(20, '2', '20', 'اسپکه', 'CGR', 'زیربار', '', '', 'به علت زیر بار بودن تست نشد'),
        buildRow(21, '2', '21', 'اسپکه', 'SW OT', 'زیربار', '', '', 'به علت زیر بار بودن تست نشد'),
        buildRow(22, '2', '22', 'اسپکه', 'SW OT', 'زیربار', '', '', 'به علت زیر بار بودن تست نشد'),
        buildRow(23, '2', '23', 'اسپکه', 'SW IT', 'زیربار', '', '', 'به علت زیر بار بودن تست نشد'),
        buildRow(24, '2', '24', 'اسپکه', 'SW IT', 'زیربار', '', '', 'به علت زیر بار بودن تست نشد'),
      ],
    },
    {
      id: 'route-fanooj-63',
      routeTitle: 'فنوج 63',
      sourceStation: 'فنوج 230',
      destinationStation: 'فنوج 63',
      lineLengthText: '0.209',
      outdoorCableType: '6 Core',
      indoorCableType: 'کانالی NZ OPUC 2*4',
      ocdfType: 'پچ پنل',
      odfConnectorType: 'SC',
      pmDateJalali: '۱۴۰۵/۰۷/۲۵',
      physical: { ...basePhysical },
      cores: [
        buildRow(1, '3', '1', 'فنوج 63', 'نامشخص', 'زیربار', '', '', 'به علت زیر بار بودن تست نشد'),
        buildRow(2, '3', '2', 'فنوج 63', 'نامشخص', 'زیربار', '', '', 'به علت زیر بار بودن تست نشد'),
        buildRow(3, '3', '3', 'فنوج 63', '', 'تاریک', '2.14', '0.209', 'نتایج OTDR به پیوست'),
        buildRow(4, '3', '4', 'فنوج 63', '', 'تاریک', '2.32', '0.209', 'نتایج OTDR به پیوست'),
        buildRow(5, '3', '5', 'فنوج 63', '', 'تاریک', '2.7', '0.209', 'نتایج OTDR به پیوست'),
        buildRow(6, '3', '6', 'فنوج 63', '', 'تاریک', '0.14', '0.187', 'نتایج OTDR به پیوست'),
      ],
    },
    {
      id: 'route-fanooj-tozi',
      routeTitle: 'توزیع',
      sourceStation: 'فنوج 230',
      destinationStation: 'توزیع',
      lineLengthText: '4',
      outdoorCableType: 'OPGW 24 Core',
      indoorCableType: 'کانالی NZ OPUC 4*6',
      ocdfType: 'پچ پنل',
      odfConnectorType: 'SC',
      pmDateJalali: '۱۴۰۵/۰۷/۲۵',
      physical: { ...basePhysical },
      cores: [
        buildRow(1, '1-1', '1', 'فنوج - توزیع', 'Sw Tozi', 'زیربار', '', '', 'به علت زیر بار بودن تست نشد'),
        buildRow(2, '1-1', '2', 'فنوج - توزیع', 'Sw Tozi', 'زیربار', '', '', 'به علت زیر بار بودن تست نشد'),
        buildRow(3, '1-1', '3', 'فنوج - توزیع', '', 'تاریک', '1.9', '4.14', 'نتایج OTDR به پیوست'),
        buildRow(4, '1-1', '4', 'فنوج - توزیع', '', 'تاریک', '0', '4.14', 'نتایج OTDR به پیوست'),
        buildRow(5, '1-1', '5', 'فنوج - توزیع', '', 'تاریک', '1.01', '4.14', 'نتایج OTDR به پیوست'),
        buildRow(6, '1-1', '6', 'فنوج - توزیع', '', 'تاریک', '1.07', '4.14', 'نتایج OTDR به پیوست'),
      ],
    },
  ];
}
