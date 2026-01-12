// 火车站数据
export interface Station {
  code: string      // 电报码
  name: string      // 车站名称
  city: string      // 城市
  pinyin?: string   // 拼音（用于搜索）
}

// 中国主要火车站列表
export const STATIONS: Station[] = [
  // 北京
  { code: 'BJP', name: '北京站', city: '北京', pinyin: 'beijing' },
  { code: 'BXP', name: '北京西站', city: '北京', pinyin: 'beijingxi' },
  { code: 'VNP', name: '北京南站', city: '北京', pinyin: 'beijingnan' },
  { code: 'VAP', name: '北京北站', city: '北京', pinyin: 'beijingbei' },
  { code: 'BOP', name: '北京朝阳站', city: '北京', pinyin: 'beijingchaoyang' },
  { code: 'IFP', name: '北京丰台站', city: '北京', pinyin: 'beijingfengtai' },
  
  // 上海
  { code: 'SHH', name: '上海站', city: '上海', pinyin: 'shanghai' },
  { code: 'SHQ', name: '上海虹桥站', city: '上海', pinyin: 'shanghaihongqiao' },
  { code: 'SNH', name: '上海南站', city: '上海', pinyin: 'shanghainan' },
  
  // 广州
  { code: 'GZQ', name: '广州站', city: '广州', pinyin: 'guangzhou' },
  { code: 'IQQ', name: '广州南站', city: '广州', pinyin: 'guangzhounan' },
  { code: 'GGQ', name: '广州东站', city: '广州', pinyin: 'guangzhoudong' },
  { code: 'GBQ', name: '广州白云站', city: '广州', pinyin: 'guangzhoubaiyun' },
  
  // 深圳
  { code: 'SZQ', name: '深圳站', city: '深圳', pinyin: 'shenzhen' },
  { code: 'IOQ', name: '深圳北站', city: '深圳', pinyin: 'shenzhenbei' },
  { code: 'JUQ', name: '深圳西站', city: '深圳', pinyin: 'shenzhenxi' },
  { code: 'IYQ', name: '福田站', city: '深圳', pinyin: 'futian' },
  
  // 成都
  { code: 'CDW', name: '成都站', city: '成都', pinyin: 'chengdu' },
  { code: 'ICW', name: '成都东站', city: '成都', pinyin: 'chengdudong' },
  { code: 'CNW', name: '成都南站', city: '成都', pinyin: 'chengdunan' },
  { code: 'IPW', name: '成都西站', city: '成都', pinyin: 'chengduxi' },
  
  // 重庆
  { code: 'CQW', name: '重庆站', city: '重庆', pinyin: 'chongqing' },
  { code: 'CUW', name: '重庆北站', city: '重庆', pinyin: 'chongqingbei' },
  { code: 'CRW', name: '重庆西站', city: '重庆', pinyin: 'chongqingxi' },
  { code: 'CYW', name: '沙坪坝站', city: '重庆', pinyin: 'shapingba' },
  
  // 杭州
  { code: 'HZH', name: '杭州站', city: '杭州', pinyin: 'hangzhou' },
  { code: 'HGH', name: '杭州东站', city: '杭州', pinyin: 'hangzhoudong' },
  { code: 'XHH', name: '杭州南站', city: '杭州', pinyin: 'hangzhounan' },
  { code: 'HKH', name: '杭州西站', city: '杭州', pinyin: 'hangzhouxi' },
  
  // 南京
  { code: 'NJH', name: '南京站', city: '南京', pinyin: 'nanjing' },
  { code: 'NKH', name: '南京南站', city: '南京', pinyin: 'nanjingnan' },
  
  // 武汉
  { code: 'WHN', name: '武汉站', city: '武汉', pinyin: 'wuhan' },
  { code: 'WCN', name: '武昌站', city: '武汉', pinyin: 'wuchang' },
  { code: 'HKN', name: '汉口站', city: '武汉', pinyin: 'hankou' },
  
  // 西安
  { code: 'XAY', name: '西安站', city: '西安', pinyin: 'xian' },
  { code: 'EAY', name: '西安北站', city: '西安', pinyin: 'xianbei' },
  
  // 长沙
  { code: 'CSQ', name: '长沙站', city: '长沙', pinyin: 'changsha' },
  { code: 'CWQ', name: '长沙南站', city: '长沙', pinyin: 'changshanan' },
  { code: 'RXQ', name: '长沙西站', city: '长沙', pinyin: 'changshaxi' },
  
  // 郑州
  { code: 'ZZF', name: '郑州站', city: '郑州', pinyin: 'zhengzhou' },
  { code: 'ZAF', name: '郑州东站', city: '郑州', pinyin: 'zhengzhoudong' },
  
  // 天津
  { code: 'TJP', name: '天津站', city: '天津', pinyin: 'tianjin' },
  { code: 'TIP', name: '天津西站', city: '天津', pinyin: 'tianjinxi' },
  { code: 'TBP', name: '天津南站', city: '天津', pinyin: 'tianjinnan' },
  
  // 济南
  { code: 'JNK', name: '济南站', city: '济南', pinyin: 'jinan' },
  { code: 'JGK', name: '济南西站', city: '济南', pinyin: 'jinanxi' },
  { code: 'JAK', name: '济南东站', city: '济南', pinyin: 'jinandong' },
  
  // 青岛
  { code: 'QDK', name: '青岛站', city: '青岛', pinyin: 'qingdao' },
  { code: 'QFK', name: '青岛北站', city: '青岛', pinyin: 'qingdaobei' },
  { code: 'QEK', name: '青岛西站', city: '青岛', pinyin: 'qingdaoxi' },
  
  // 沈阳
  { code: 'SYT', name: '沈阳站', city: '沈阳', pinyin: 'shenyang' },
  { code: 'SOT', name: '沈阳北站', city: '沈阳', pinyin: 'shenyangbei' },
  { code: 'SPT', name: '沈阳南站', city: '沈阳', pinyin: 'shenyangnan' },
  
  // 大连
  { code: 'DLT', name: '大连站', city: '大连', pinyin: 'dalian' },
  { code: 'DVT', name: '大连北站', city: '大连', pinyin: 'dalianbei' },
  
  // 哈尔滨
  { code: 'HBB', name: '哈尔滨站', city: '哈尔滨', pinyin: 'haerbin' },
  { code: 'VAB', name: '哈尔滨西站', city: '哈尔滨', pinyin: 'haerbinxi' },
  
  // 长春
  { code: 'CCT', name: '长春站', city: '长春', pinyin: 'changchun' },
  { code: 'CRT', name: '长春西站', city: '长春', pinyin: 'changchunxi' },
  
  // 昆明
  { code: 'KMM', name: '昆明站', city: '昆明', pinyin: 'kunming' },
  { code: 'KAM', name: '昆明南站', city: '昆明', pinyin: 'kunmingnan' },
  
  // 南宁
  { code: 'NNZ', name: '南宁站', city: '南宁', pinyin: 'nanning' },
  { code: 'NFZ', name: '南宁东站', city: '南宁', pinyin: 'nanningdong' },
  
  // 贵阳
  { code: 'GIW', name: '贵阳站', city: '贵阳', pinyin: 'guiyang' },
  { code: 'KQW', name: '贵阳北站', city: '贵阳', pinyin: 'guiyangbei' },
  
  // 福州
  { code: 'FZS', name: '福州站', city: '福州', pinyin: 'fuzhou' },
  { code: 'FYS', name: '福州南站', city: '福州', pinyin: 'fuzhounan' },
  
  // 厦门
  { code: 'XMS', name: '厦门站', city: '厦门', pinyin: 'xiamen' },
  { code: 'XKS', name: '厦门北站', city: '厦门', pinyin: 'xiamenbei' },
  
  // 南昌
  { code: 'NCG', name: '南昌站', city: '南昌', pinyin: 'nanchang' },
  { code: 'NXG', name: '南昌西站', city: '南昌', pinyin: 'nanchangxi' },
  
  // 合肥
  { code: 'HFH', name: '合肥站', city: '合肥', pinyin: 'hefei' },
  { code: 'ENH', name: '合肥南站', city: '合肥', pinyin: 'hefeinan' },
  
  // 石家庄
  { code: 'SJP', name: '石家庄站', city: '石家庄', pinyin: 'shijiazhuang' },
  { code: 'SXP', name: '石家庄东站', city: '石家庄', pinyin: 'shijiazhuangdong' },
  
  // 太原
  { code: 'TYV', name: '太原站', city: '太原', pinyin: 'taiyuan' },
  { code: 'TNV', name: '太原南站', city: '太原', pinyin: 'taiyuannan' },
  
  // 兰州
  { code: 'LZJ', name: '兰州站', city: '兰州', pinyin: 'lanzhou' },
  { code: 'LHJ', name: '兰州西站', city: '兰州', pinyin: 'lanzhouxi' },
  
  // 乌鲁木齐
  { code: 'WAR', name: '乌鲁木齐站', city: '乌鲁木齐', pinyin: 'wulumuqi' },
  { code: 'WMR', name: '乌鲁木齐南站', city: '乌鲁木齐', pinyin: 'wulumuqinan' },
  
  // 银川
  { code: 'YCJ', name: '银川站', city: '银川', pinyin: 'yinchuan' },
  
  // 西宁
  { code: 'XNO', name: '西宁站', city: '西宁', pinyin: 'xining' },
  
  // 呼和浩特
  { code: 'HHC', name: '呼和浩特站', city: '呼和浩特', pinyin: 'huhehaote' },
  { code: 'NDC', name: '呼和浩特东站', city: '呼和浩特', pinyin: 'huhehaotedong' },
  
  // 海口
  { code: 'VUQ', name: '海口站', city: '海口', pinyin: 'haikou' },
  { code: 'HKQ', name: '海口东站', city: '海口', pinyin: 'haikoudong' },
  
  // 三亚
  { code: 'SEQ', name: '三亚站', city: '三亚', pinyin: 'sanya' },
  
  // 苏州
  { code: 'SZH', name: '苏州站', city: '苏州', pinyin: 'suzhou' },
  { code: 'OHH', name: '苏州北站', city: '苏州', pinyin: 'suzhoubei' },
  { code: 'ITH', name: '苏州园区站', city: '苏州', pinyin: 'suzhouyuanqu' },
  
  // 无锡
  { code: 'WXH', name: '无锡站', city: '无锡', pinyin: 'wuxi' },
  { code: 'WGH', name: '无锡东站', city: '无锡', pinyin: 'wuxidong' },
  
  // 常州
  { code: 'CZH', name: '常州站', city: '常州', pinyin: 'changzhou' },
  { code: 'ESH', name: '常州北站', city: '常州', pinyin: 'changzhoubei' },
  
  // 宁波
  { code: 'NGH', name: '宁波站', city: '宁波', pinyin: 'ningbo' },
  
  // 温州
  { code: 'RZH', name: '温州站', city: '温州', pinyin: 'wenzhou' },
  { code: 'VRH', name: '温州南站', city: '温州', pinyin: 'wenzhounan' },
  
  // 烟台
  { code: 'YTK', name: '烟台站', city: '烟台', pinyin: 'yantai' },
  { code: 'YCK', name: '烟台南站', city: '烟台', pinyin: 'yantainan' },
  
  // 珠海
  { code: 'ZHQ', name: '珠海站', city: '珠海', pinyin: 'zhuhai' },
  
  // 桂林
  { code: 'GLZ', name: '桂林站', city: '桂林', pinyin: 'guilin' },
  { code: 'GBZ', name: '桂林北站', city: '桂林', pinyin: 'guilinbei' },
  
  // 香港
  { code: 'XJA', name: '香港西九龙站', city: '香港', pinyin: 'xianggang xijiulong' },
]

/**
 * 搜索火车站
 * @param keyword 关键词（支持城市、车站名、电报码、拼音）
 */
export function searchStations(keyword: string): Station[] {
  if (!keyword.trim()) {
    return STATIONS.slice(0, 20) // 返回前20个热门车站
  }
  
  const kw = keyword.toLowerCase().trim()
  
  return STATIONS.filter(station => {
    return (
      station.code.toLowerCase().includes(kw) ||
      station.name.includes(kw) ||
      station.city.includes(kw) ||
      (station.pinyin && station.pinyin.includes(kw))
    )
  }).slice(0, 20)
}
