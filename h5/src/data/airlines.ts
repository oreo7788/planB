// 航空公司数据
export interface Airline {
  code: string       // 二字码
  name: string       // 航司名称
  shortName: string  // 简称
  color: string      // 主题色
}

// 常见航空公司
export const AIRLINES: Record<string, Airline> = {
  // 国内三大航
  'CA': { code: 'CA', name: '中国国际航空', shortName: '国航', color: '#C41230' },
  'MU': { code: 'MU', name: '中国东方航空', shortName: '东航', color: '#003399' },
  'CZ': { code: 'CZ', name: '中国南方航空', shortName: '南航', color: '#005BAC' },
  
  // 其他国内航司
  'HU': { code: 'HU', name: '海南航空', shortName: '海航', color: '#C8102E' },
  '3U': { code: '3U', name: '四川航空', shortName: '川航', color: '#E60012' },
  'MF': { code: 'MF', name: '厦门航空', shortName: '厦航', color: '#003D79' },
  'ZH': { code: 'ZH', name: '深圳航空', shortName: '深航', color: '#E4002B' },
  'FM': { code: 'FM', name: '上海航空', shortName: '上航', color: '#E31837' },
  'HO': { code: 'HO', name: '吉祥航空', shortName: '吉祥', color: '#D4001A' },
  '9C': { code: '9C', name: '春秋航空', shortName: '春秋', color: '#6AB547' },
  'SC': { code: 'SC', name: '山东航空', shortName: '山航', color: '#0066B3' },
  'GS': { code: 'GS', name: '天津航空', shortName: '天航', color: '#003DA5' },
  'KN': { code: 'KN', name: '联合航空', shortName: '联航', color: '#E60012' },
  'BK': { code: 'BK', name: '奥凯航空', shortName: '奥凯', color: '#003087' },
  'EU': { code: 'EU', name: '成都航空', shortName: '成航', color: '#E4002B' },
  'GJ': { code: 'GJ', name: '长龙航空', shortName: '长龙', color: '#00529B' },
  'TV': { code: 'TV', name: '西藏航空', shortName: '藏航', color: '#003DA5' },
  'DR': { code: 'DR', name: '瑞丽航空', shortName: '瑞丽', color: '#E4002B' },
  'PN': { code: 'PN', name: '西部航空', shortName: '西部', color: '#E60012' },
  'G5': { code: 'G5', name: '华夏航空', shortName: '华夏', color: '#003DA5' },
  'NS': { code: 'NS', name: '河北航空', shortName: '河北', color: '#005BAC' },
  'CN': { code: 'CN', name: '大新华航空', shortName: '大新华', color: '#C8102E' },
  'Y8': { code: 'Y8', name: '扬子江航空', shortName: '扬子江', color: '#003087' },
  'GT': { code: 'GT', name: '桂林航空', shortName: '桂林', color: '#00A651' },
  'QW': { code: 'QW', name: '青岛航空', shortName: '青航', color: '#003DA5' },
  'DZ': { code: 'DZ', name: '东海航空', shortName: '东海', color: '#003087' },
  '8L': { code: '8L', name: '祥鹏航空', shortName: '祥鹏', color: '#FF6600' },
  'A6': { code: 'A6', name: '红土航空', shortName: '红土', color: '#C41230' },
  
  // 港澳台航司
  'CX': { code: 'CX', name: '国泰航空', shortName: '国泰', color: '#005A49' },
  'KA': { code: 'KA', name: '港龙航空', shortName: '港龙', color: '#C8102E' },
  'HX': { code: 'HX', name: '香港航空', shortName: '港航', color: '#C8102E' },
  'NX': { code: 'NX', name: '澳门航空', shortName: '澳航', color: '#00529B' },
  'BR': { code: 'BR', name: '长荣航空', shortName: '长荣', color: '#00A651' },
  'CI': { code: 'CI', name: '中华航空', shortName: '华航', color: '#7B2D82' },
  
  // 国际航司
  'AA': { code: 'AA', name: '美国航空', shortName: '美航', color: '#0078D2' },
  'UA': { code: 'UA', name: '美联航', shortName: '美联航', color: '#002244' },
  'DL': { code: 'DL', name: '达美航空', shortName: '达美', color: '#E31837' },
  'BA': { code: 'BA', name: '英国航空', shortName: '英航', color: '#075AAA' },
  'AF': { code: 'AF', name: '法国航空', shortName: '法航', color: '#002157' },
  'LH': { code: 'LH', name: '汉莎航空', shortName: '汉莎', color: '#05164D' },
  'SQ': { code: 'SQ', name: '新加坡航空', shortName: '新航', color: '#F9A01B' },
  'EK': { code: 'EK', name: '阿联酋航空', shortName: '阿航', color: '#D71921' },
  'QR': { code: 'QR', name: '卡塔尔航空', shortName: '卡航', color: '#5C0632' },
  'TG': { code: 'TG', name: '泰国航空', shortName: '泰航', color: '#5C2D91' },
  'JL': { code: 'JL', name: '日本航空', shortName: '日航', color: '#C8102E' },
  'NH': { code: 'NH', name: '全日空', shortName: '全日空', color: '#003DA5' },
  'KE': { code: 'KE', name: '大韩航空', shortName: '大韩', color: '#004990' },
  'OZ': { code: 'OZ', name: '韩亚航空', shortName: '韩亚', color: '#C8102E' },
  'QF': { code: 'QF', name: '澳洲航空', shortName: '澳航', color: '#E40000' },
  'AC': { code: 'AC', name: '加拿大航空', shortName: '加航', color: '#C8102E' },
}

/**
 * 根据航班号获取航司信息
 * @param flightNumber 航班号，如 CA1234, MU5678
 */
export function getAirlineByFlightNumber(flightNumber: string): Airline | null {
  if (!flightNumber) return null
  
  // 提取航司代码（前2-3个字符，直到遇到数字）
  const match = flightNumber.match(/^([A-Z0-9]{2})/i)
  if (!match) return null
  
  const code = match[1].toUpperCase()
  return AIRLINES[code] || null
}
