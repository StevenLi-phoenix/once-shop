'use strict';

const CATEGORIES = [
  { id: 'table', name: '餐具', en: 'TABLE' },
  { id: 'travel', name: '旅行', en: 'TRAVEL' },
  { id: 'clean', name: '清洁', en: 'CLEAN' },
  { id: 'digital', name: '数码', en: 'DIGITAL' },
];

const PRODUCTS = [
  {
    sku: 'hashi',
    name: '一次性筷子 · 桧木',
    en: 'HINOKI HASHI',
    price: 12,
    unit: '100 双',
    cat: 'table',
    tint: '#e9e1cd',
    art: 'chopsticks',
    feature: true,
    blurb: '拆开即用，用完即弃。上一双和下一双，从来不是同一双。',
    desc:
      '桧木，无漆无蜡，长度 20cm。独立纸套包装，适合外卖、野餐，以及不想洗碗的晚上。不建议冲洗后使用第二次，虽然我们知道你会。',
    specs: [
      ['材质', '桧木'],
      ['规格', '100 双 / 包'],
      ['长度', '20 cm'],
      ['保存', '干燥通风处'],
    ],
  },
  {
    sku: 'cup',
    name: '一次性纸杯 · 原白',
    en: 'PAPER CUP',
    price: 18,
    unit: '50 只',
    cat: 'table',
    tint: '#e6dbc4',
    art: 'cup',
    blurb: '装过一次水，它就不再是一只杯子了。',
    desc:
      '320ml，食品级原纸，内壁 PE 淋膜。冷热皆可，杯口做了双层卷边，捏起来不会软。装第二次也不漏，只是我们已经不算它是一只新杯子。',
    specs: [
      ['容量', '320 ml'],
      ['规格', '50 只 / 包'],
      ['材质', '食品级原纸'],
      ['适用', '冷饮 / 热饮'],
    ],
  },
  {
    sku: 'camera',
    name: '一次性相机 · 27 张',
    en: 'SINGLE USE CAMERA',
    price: 168,
    unit: '1 台',
    cat: 'digital',
    tint: '#dfe3dc',
    art: 'camera',
    feature: true,
    blurb: '27 次快门。没有预览，没有删除，也没有第二次。',
    desc:
      '35mm 胶片，ISO 400，固定焦距，内置闪光灯。拍完寄回冲洗，照片回来的时候你已经忘了当时在想什么——这正是它比手机好的地方。',
    specs: [
      ['胶片', '35mm 彩色负片'],
      ['张数', '27 张'],
      ['感光度', 'ISO 400'],
      ['闪光灯', '内置，约 15 次'],
    ],
  },
  {
    sku: 'raincoat',
    name: '一次性雨衣 · 透明',
    en: 'PACKABLE RAINCOAT',
    price: 9,
    unit: '1 件',
    cat: 'travel',
    tint: '#dde5e8',
    art: 'raincoat',
    feature: true,
    blurb: '下雨的时候有用。雨停之后，它就该消失了。',
    desc:
      '均码，带帽，PE 材质，折叠后只有巴掌大。景区门口卖三十，我们卖九块。穿一次就够，毕竟你只淋一场雨。',
    specs: [
      ['材质', 'PE'],
      ['尺码', '均码'],
      ['重量', '80 g'],
      ['收纳', '折叠至 12 × 8 cm'],
    ],
  },
  {
    sku: 'slippers',
    name: '一次性拖鞋 · 棉',
    en: 'COTTON SLIPPERS',
    price: 6,
    unit: '1 双',
    cat: 'travel',
    tint: '#eae3d6',
    art: 'slippers',
    blurb: '只陪你走完这一晚的地毯。',
    desc:
      '酒店同款，加厚棉底，防滑。适合出差、留宿，以及不想让客人穿鞋进屋的家。走多了会起球，那是它提醒你该睡了。',
    specs: [
      ['材质', '棉 + EVA 底'],
      ['尺码', '36–44'],
      ['规格', '1 双 / 包'],
      ['颜色', '米白'],
    ],
  },
  {
    sku: 'razor',
    name: '一次性剃须刀 · 双刃',
    en: 'DISPOSABLE RAZOR',
    price: 14,
    unit: '1 支',
    cat: 'clean',
    tint: '#dfe0e6',
    art: 'razor',
    feature: true,
    blurb: '锋利只有一次。第二次，它开始拉扯。',
    desc:
      '双刃不锈钢，带润滑条，手柄不可替换刀头——因为不需要。出差、健身房、酒店洗手台上那把总是很好用的，就是它。',
    specs: [
      ['刀片', '双刃不锈钢'],
      ['数量', '1 支'],
      ['润滑条', '有'],
      ['刀头', '不可替换'],
    ],
  },
  {
    sku: 'towel',
    name: '一次性毛巾 · 纯棉',
    en: 'COMPRESSED TOWEL',
    price: 5,
    unit: '1 条',
    cat: 'clean',
    tint: '#ece5d8',
    art: 'towel',
    blurb: '洗完就湿了。湿了，就不再是毛巾。',
    desc:
      '纯棉无纺布，遇水展开，30 × 60cm。独立压缩包装，扔进包里像一颗糖。展开之后塞不回去，这一点和所有一次性的东西一样。',
    specs: [
      ['材质', '纯棉无纺布'],
      ['尺寸', '30 × 60 cm'],
      ['包装', '独立压缩'],
      ['遇水', '3 秒展开'],
    ],
  },
  {
    sku: 'lighter',
    name: '一次性打火机 · 砂轮',
    en: 'DISPOSABLE LIGHTER',
    price: 3,
    unit: '1 只',
    cat: 'travel',
    tint: '#ecdfd6',
    art: 'lighter',
    blurb: '点得着，说明还有下一次。点不着，它就完成了。',
    desc:
      '砂轮点火，火焰可调，透明油仓——这样你能看见它还剩下多少。用完不加油，直接丢进回收箱。它是本店最诚实的一件商品。',
    specs: [
      ['点火', '砂轮'],
      ['油仓', '透明可视'],
      ['数量', '1 只'],
      ['火焰', '可调'],
    ],
  },
];

const bySku = Object.fromEntries(PRODUCTS.map((p) => [p.sku, p]));
const byCat = (id) => PRODUCTS.filter((p) => p.cat === id);
const catName = (id) => (CATEGORIES.find((c) => c.id === id) || { name: '全部商品' }).name;

module.exports = { CATEGORIES, PRODUCTS, bySku, byCat, catName };
