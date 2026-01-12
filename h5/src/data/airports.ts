// 机场数据
export interface Airport {
  code: string      // 三字码
  name: string      // 机场名称
  city: string      // 城市
  pinyin?: string   // 拼音（用于搜索）
}

// 中国主要机场列表
export const AIRPORTS: Airport[] = [
  // 北京
  { code: 'PEK', name: '北京首都国际机场', city: '北京', pinyin: 'beijing shoudu' },
  { code: 'PKX', name: '北京大兴国际机场', city: '北京', pinyin: 'beijing daxing' },
  
  // 上海
  { code: 'PVG', name: '上海浦东国际机场', city: '上海', pinyin: 'shanghai pudong' },
  { code: 'SHA', name: '上海虹桥国际机场', city: '上海', pinyin: 'shanghai hongqiao' },
  
  // 广州/深圳
  { code: 'CAN', name: '广州白云国际机场', city: '广州', pinyin: 'guangzhou baiyun' },
  { code: 'SZX', name: '深圳宝安国际机场', city: '深圳', pinyin: 'shenzhen baoan' },
  
  // 成都
  { code: 'CTU', name: '成都双流国际机场', city: '成都', pinyin: 'chengdu shuangliu' },
  { code: 'TFU', name: '成都天府国际机场', city: '成都', pinyin: 'chengdu tianfu' },
  
  // 重庆
  { code: 'CKG', name: '重庆江北国际机场', city: '重庆', pinyin: 'chongqing jiangbei' },
  
  // 杭州
  { code: 'HGH', name: '杭州萧山国际机场', city: '杭州', pinyin: 'hangzhou xiaoshan' },
  
  // 南京
  { code: 'NKG', name: '南京禄口国际机场', city: '南京', pinyin: 'nanjing lukou' },
  
  // 武汉
  { code: 'WUH', name: '武汉天河国际机场', city: '武汉', pinyin: 'wuhan tianhe' },
  
  // 西安
  { code: 'XIY', name: '西安咸阳国际机场', city: '西安', pinyin: 'xian xianyang' },
  
  // 昆明
  { code: 'KMG', name: '昆明长水国际机场', city: '昆明', pinyin: 'kunming changshui' },
  
  // 长沙
  { code: 'CSX', name: '长沙黄花国际机场', city: '长沙', pinyin: 'changsha huanghua' },
  
  // 郑州
  { code: 'CGO', name: '郑州新郑国际机场', city: '郑州', pinyin: 'zhengzhou xinzheng' },
  
  // 青岛
  { code: 'TAO', name: '青岛胶东国际机场', city: '青岛', pinyin: 'qingdao jiaodong' },
  
  // 厦门
  { code: 'XMN', name: '厦门高崎国际机场', city: '厦门', pinyin: 'xiamen gaoqi' },
  
  // 天津
  { code: 'TSN', name: '天津滨海国际机场', city: '天津', pinyin: 'tianjin binhai' },
  
  // 大连
  { code: 'DLC', name: '大连周水子国际机场', city: '大连', pinyin: 'dalian zhoushuizi' },
  
  // 沈阳
  { code: 'SHE', name: '沈阳桃仙国际机场', city: '沈阳', pinyin: 'shenyang taoxian' },
  
  // 哈尔滨
  { code: 'HRB', name: '哈尔滨太平国际机场', city: '哈尔滨', pinyin: 'haerbin taiping' },
  
  // 海口
  { code: 'HAK', name: '海口美兰国际机场', city: '海口', pinyin: 'haikou meilan' },
  
  // 三亚
  { code: 'SYX', name: '三亚凤凰国际机场', city: '三亚', pinyin: 'sanya fenghuang' },
  
  // 福州
  { code: 'FOC', name: '福州长乐国际机场', city: '福州', pinyin: 'fuzhou changle' },
  
  // 南昌
  { code: 'KHN', name: '南昌昌北国际机场', city: '南昌', pinyin: 'nanchang changbei' },
  
  // 合肥
  { code: 'HFE', name: '合肥新桥国际机场', city: '合肥', pinyin: 'hefei xinqiao' },
  
  // 济南
  { code: 'TNA', name: '济南遥墙国际机场', city: '济南', pinyin: 'jinan yaoqiang' },
  
  // 太原
  { code: 'TYN', name: '太原武宿国际机场', city: '太原', pinyin: 'taiyuan wusu' },
  
  // 石家庄
  { code: 'SJW', name: '石家庄正定国际机场', city: '石家庄', pinyin: 'shijiazhuang zhengding' },
  
  // 长春
  { code: 'CGQ', name: '长春龙嘉国际机场', city: '长春', pinyin: 'changchun longjia' },
  
  // 贵阳
  { code: 'KWE', name: '贵阳龙洞堡国际机场', city: '贵阳', pinyin: 'guiyang longdongbao' },
  
  // 南宁
  { code: 'NNG', name: '南宁吴圩国际机场', city: '南宁', pinyin: 'nanning wuxu' },
  
  // 兰州
  { code: 'LHW', name: '兰州中川国际机场', city: '兰州', pinyin: 'lanzhou zhongchuan' },
  
  // 乌鲁木齐
  { code: 'URC', name: '乌鲁木齐地窝堡国际机场', city: '乌鲁木齐', pinyin: 'wulumuqi diwopu' },
  
  // 银川
  { code: 'INC', name: '银川河东国际机场', city: '银川', pinyin: 'yinchuan hedong' },
  
  // 西宁
  { code: 'XNN', name: '西宁曹家堡国际机场', city: '西宁', pinyin: 'xining caojiapu' },
  
  // 呼和浩特
  { code: 'HET', name: '呼和浩特白塔国际机场', city: '呼和浩特', pinyin: 'huhehaote baita' },
  
  // 拉萨
  { code: 'LXA', name: '拉萨贡嘎国际机场', city: '拉萨', pinyin: 'lasa gongga' },
  
  // 珠海
  { code: 'ZUH', name: '珠海金湾机场', city: '珠海', pinyin: 'zhuhai jinwan' },
  
  // 无锡
  { code: 'WUX', name: '无锡硕放机场', city: '无锡', pinyin: 'wuxi shuofang' },
  
  // 宁波
  { code: 'NGB', name: '宁波栎社国际机场', city: '宁波', pinyin: 'ningbo lishe' },
  
  // 温州
  { code: 'WNZ', name: '温州龙湾国际机场', city: '温州', pinyin: 'wenzhou longwan' },
  
  // 烟台
  { code: 'YNT', name: '烟台蓬莱国际机场', city: '烟台', pinyin: 'yantai penglai' },
  
  // 威海
  { code: 'WEH', name: '威海大水泊国际机场', city: '威海', pinyin: 'weihai dashuipo' },
  
  // 桂林
  { code: 'KWL', name: '桂林两江国际机场', city: '桂林', pinyin: 'guilin liangjiang' },
  
  // 丽江
  { code: 'LJG', name: '丽江三义国际机场', city: '丽江', pinyin: 'lijiang sanyi' },
  
  // 西双版纳
  { code: 'JHG', name: '西双版纳嘎洒国际机场', city: '西双版纳', pinyin: 'xishuangbanna gasa' },
  
  // 张家界
  { code: 'DYG', name: '张家界荷花国际机场', city: '张家界', pinyin: 'zhangjiajie hehua' },
  
  // 九寨沟
  { code: 'JZH', name: '九寨黄龙机场', city: '九寨沟', pinyin: 'jiuzhaigou huanglong' },
  
  // 港澳台
  { code: 'HKG', name: '香港国际机场', city: '香港', pinyin: 'xianggang' },
  { code: 'MFM', name: '澳门国际机场', city: '澳门', pinyin: 'aomen' },
  { code: 'TPE', name: '台北桃园国际机场', city: '台北', pinyin: 'taibei taoyuan' },
  { code: 'TSA', name: '台北松山机场', city: '台北', pinyin: 'taibei songshan' },
  
  // 国际主要机场
  { code: 'NRT', name: '东京成田国际机场', city: '东京', pinyin: 'dongjing chengtan' },
  { code: 'HND', name: '东京羽田国际机场', city: '东京', pinyin: 'dongjing yutian' },
  { code: 'ICN', name: '首尔仁川国际机场', city: '首尔', pinyin: 'shouer renchuan' },
  { code: 'GMP', name: '首尔金浦国际机场', city: '首尔', pinyin: 'shouer jinpu' },
  { code: 'SIN', name: '新加坡樟宜机场', city: '新加坡', pinyin: 'xinjiapo zhangyi' },
  { code: 'BKK', name: '曼谷素万那普机场', city: '曼谷', pinyin: 'mangu suwannap' },
  { code: 'KUL', name: '吉隆坡国际机场', city: '吉隆坡', pinyin: 'jilongpo' },
  { code: 'DXB', name: '迪拜国际机场', city: '迪拜', pinyin: 'dibai' },
  { code: 'LHR', name: '伦敦希思罗机场', city: '伦敦', pinyin: 'lundun xisilu' },
  { code: 'CDG', name: '巴黎戴高乐机场', city: '巴黎', pinyin: 'bali daigaole' },
  { code: 'FRA', name: '法兰克福机场', city: '法兰克福', pinyin: 'falankefu' },
  { code: 'LAX', name: '洛杉矶国际机场', city: '洛杉矶', pinyin: 'luosanji' },
  { code: 'JFK', name: '纽约肯尼迪机场', city: '纽约', pinyin: 'niuyue kennidi' },
  { code: 'SFO', name: '旧金山国际机场', city: '旧金山', pinyin: 'jiujinshan' },
  { code: 'SYD', name: '悉尼金斯福德机场', city: '悉尼', pinyin: 'xini' },
]

/**
 * 搜索机场
 * @param keyword 关键词（支持城市、机场名、三字码、拼音）
 */
export function searchAirports(keyword: string): Airport[] {
  if (!keyword.trim()) {
    return AIRPORTS.slice(0, 20) // 返回前20个热门机场
  }
  
  const kw = keyword.toLowerCase().trim()
  
  return AIRPORTS.filter(airport => {
    return (
      airport.code.toLowerCase().includes(kw) ||
      airport.name.includes(kw) ||
      airport.city.includes(kw) ||
      (airport.pinyin && airport.pinyin.includes(kw))
    )
  }).slice(0, 20)
}
