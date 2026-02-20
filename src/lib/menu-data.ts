// ==========================================================================
// AVOS Menu Data — Bilingual Chinese Restaurant Menu
// ==========================================================================

export interface MenuItem {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  price: number;
  category: string;
  image: string;
  spiceLevel: number; // 0-3
  allergens: string[];
  isPopular: boolean;
  pairings: string[]; // ids of suggested items
}

export const MENU_ITEMS: MenuItem[] = [
  // === Appetizers ===
  {
    id: "spring-rolls",
    name: "Spring Rolls",
    nameZh: "春卷",
    description: "Crispy fried rolls stuffed with vegetables and glass noodles. Served with sweet chili sauce.",
    descriptionZh: "酥脆炸春卷，内含蔬菜和粉丝，配甜辣酱。",
    price: 7.99,
    category: "Appetizers",
    image: "/menu/spring-rolls.jpg",
    spiceLevel: 0,
    allergens: ["Gluten", "Soy"],
    isPopular: true,
    pairings: ["wonton-soup", "kung-pao-chicken"],
  },
  {
    id: "crab-rangoon",
    name: "Crab Rangoon",
    nameZh: "蟹角",
    description: "Crispy wonton wrappers filled with cream cheese and crab meat.",
    descriptionZh: "酥脆馄饨皮包裹奶油芝士和蟹肉。",
    price: 8.99,
    category: "Appetizers",
    image: "/menu/crab-rangoon.jpg",
    spiceLevel: 0,
    allergens: ["Gluten", "Dairy", "Shellfish"],
    isPopular: true,
    pairings: ["hot-sour-soup", "general-tsos"],
  },

  // === Soups ===
  {
    id: "wonton-soup",
    name: "Wonton Soup",
    nameZh: "馄饨汤",
    description: "Handmade pork and shrimp wontons in a clear savory broth with baby bok choy.",
    descriptionZh: "手工猪肉虾仁馄饨，清汤配小白菜。",
    price: 6.99,
    category: "Soups",
    image: "/menu/wonton-soup.jpg",
    spiceLevel: 0,
    allergens: ["Gluten", "Shellfish", "Soy"],
    isPopular: false,
    pairings: ["spring-rolls", "fried-rice"],
  },
  {
    id: "hot-sour-soup",
    name: "Hot and Sour Soup",
    nameZh: "酸辣汤",
    description: "Traditional Sichuan soup with tofu, bamboo shoots, egg, and wood ear mushrooms.",
    descriptionZh: "传统四川酸辣汤，配豆腐、竹笋、鸡蛋和木耳。",
    price: 7.49,
    category: "Soups",
    image: "/menu/hot-sour-soup.jpg",
    spiceLevel: 2,
    allergens: ["Gluten", "Egg", "Soy"],
    isPopular: true,
    pairings: ["kung-pao-chicken", "mapo-tofu"],
  },
  {
    id: "miso-soup",
    name: "Miso Soup",
    nameZh: "味噌汤",
    description: "Light and warming Japanese-style miso broth with tofu and seaweed.",
    descriptionZh: "清淡温暖的日式味噌汤，配豆腐和海带。",
    price: 4.99,
    category: "Soups",
    image: "/menu/miso-soup.jpg",
    spiceLevel: 0,
    allergens: ["Soy"],
    isPopular: false,
    pairings: ["shrimp-lo-mein", "orange-chicken"],
  },

  // === Poultry ===
  {
    id: "general-tsos",
    name: "General Tso's Chicken",
    nameZh: "左宗棠鸡",
    description: "Crispy chicken chunks tossed in our signature sweet, savory, and slightly spicy sauce. An American-Chinese classic.",
    descriptionZh: "酥脆鸡块裹上招牌甜辣酱，经典美式中餐。",
    price: 14.99,
    category: "Poultry",
    image: "/menu/general-tsos.jpg",
    spiceLevel: 1,
    allergens: ["Gluten", "Soy", "Egg"],
    isPopular: true,
    pairings: ["fried-rice", "spring-rolls", "miso-soup"],
  },
  {
    id: "kung-pao-chicken",
    name: "Kung Pao Chicken",
    nameZh: "宫保鸡丁",
    description: "Wok-fired chicken with roasted peanuts, dried chili peppers, and vegetables in a savory-spicy sauce.",
    descriptionZh: "鸡丁与花生、干辣椒和蔬菜爆炒，酱香微辣。",
    price: 15.99,
    category: "Poultry",
    image: "/menu/kung-pao-chicken.jpg",
    spiceLevel: 2,
    allergens: ["Peanuts", "Soy", "Gluten"],
    isPopular: true,
    pairings: ["fried-rice", "hot-sour-soup", "spring-rolls"],
  },
  {
    id: "orange-chicken",
    name: "Orange Chicken",
    nameZh: "陈皮鸡",
    description: "Tender chicken battered and fried, glazed with a tangy orange citrus sauce.",
    descriptionZh: "鸡肉裹浆酥炸，淋上香橙酱汁。",
    price: 14.49,
    category: "Poultry",
    image: "/menu/orange-chicken.jpg",
    spiceLevel: 0,
    allergens: ["Gluten", "Soy", "Egg"],
    isPopular: true,
    pairings: ["fried-rice", "wonton-soup"],
  },
  {
    id: "peking-duck",
    name: "Peking Duck",
    nameZh: "北京烤鸭",
    description: "Whole roasted duck with crispy skin, served with thin pancakes, scallions, cucumber, and hoisin sauce.",
    descriptionZh: "整只烤鸭，配薄饼、葱丝、黄瓜和甜面酱。",
    price: 24.99,
    category: "Poultry",
    image: "/menu/peking-duck.jpg",
    spiceLevel: 0,
    allergens: ["Gluten", "Soy"],
    isPopular: false,
    pairings: ["hot-sour-soup", "mapo-tofu"],
  },

  // === Beef & Pork ===
  {
    id: "beef-broccoli",
    name: "Beef with Broccoli",
    nameZh: "西兰花牛肉",
    description: "Tender sliced beef and fresh broccoli stir-fried in a rich oyster-soy sauce.",
    descriptionZh: "嫩牛肉片与新鲜西兰花爆炒，淋蚝油酱汁。",
    price: 15.99,
    category: "Beef & Pork",
    image: "/menu/beef-broccoli.jpg",
    spiceLevel: 0,
    allergens: ["Soy", "Gluten"],
    isPopular: true,
    pairings: ["fried-rice", "wonton-soup"],
  },
  {
    id: "sweet-sour-pork",
    name: "Sweet and Sour Pork",
    nameZh: "咕噜肉",
    description: "Crispy pork pieces with bell peppers and pineapple in a tangy sweet and sour sauce.",
    descriptionZh: "酥脆猪肉配青椒和菠萝，酸甜酱汁。",
    price: 14.49,
    category: "Beef & Pork",
    image: "/menu/sweet-sour-pork.jpg",
    spiceLevel: 0,
    allergens: ["Gluten", "Soy", "Egg"],
    isPopular: false,
    pairings: ["fried-rice", "spring-rolls"],
  },

  // === Noodles & Rice ===
  {
    id: "fried-rice",
    name: "Fried Rice",
    nameZh: "炒饭",
    description: "Wok-fried rice with egg, green onions, carrots, and peas. Choice of chicken, shrimp, or vegetable.",
    descriptionZh: "蛋炒饭配葱花、胡萝卜和豌豆。可选鸡肉、虾仁或素菜。",
    price: 11.99,
    category: "Noodles & Rice",
    image: "/menu/fried-rice.jpg",
    spiceLevel: 0,
    allergens: ["Egg", "Soy", "Gluten"],
    isPopular: true,
    pairings: ["general-tsos", "kung-pao-chicken", "orange-chicken"],
  },
  {
    id: "shrimp-lo-mein",
    name: "Shrimp Lo Mein",
    nameZh: "虾仁捞面",
    description: "Soft egg noodles stir-fried with plump shrimp, vegetables, and savory soy sauce.",
    descriptionZh: "鸡蛋面与大虾仁和蔬菜炒制，酱油调味。",
    price: 14.99,
    category: "Noodles & Rice",
    image: "/menu/shrimp-lo-mein.jpg",
    spiceLevel: 0,
    allergens: ["Gluten", "Shellfish", "Egg", "Soy"],
    isPopular: true,
    pairings: ["hot-sour-soup", "spring-rolls"],
  },
  {
    id: "pad-thai",
    name: "Pad Thai",
    nameZh: "泰式炒河粉",
    description: "Rice noodles stir-fried with shrimp, egg, bean sprouts, and peanuts in tamarind sauce.",
    descriptionZh: "河粉与虾仁、鸡蛋、豆芽和花生炒制，罗望子酱调味。",
    price: 13.99,
    category: "Noodles & Rice",
    image: "/menu/pad-thai.jpg",
    spiceLevel: 1,
    allergens: ["Shellfish", "Peanuts", "Egg", "Soy"],
    isPopular: false,
    pairings: ["spring-rolls", "miso-soup"],
  },

  // === Seafood ===
  // (shrimp-lo-mein is above in Noodles)

  // === Vegetables ===
  {
    id: "mapo-tofu",
    name: "Ma Po Tofu",
    nameZh: "麻婆豆腐",
    description: "Silken tofu in a fiery Sichuan chili-bean sauce with minced pork and Sichuan peppercorns.",
    descriptionZh: "嫩豆腐配四川辣豆瓣酱、肉末和花椒。",
    price: 12.99,
    category: "Vegetables",
    image: "/menu/mapo-tofu.jpg",
    spiceLevel: 3,
    allergens: ["Soy", "Gluten"],
    isPopular: true,
    pairings: ["fried-rice", "hot-sour-soup"],
  },

  // === Desserts ===
  {
    id: "mango-sticky-rice",
    name: "Mango Sticky Rice",
    nameZh: "芒果糯米饭",
    description: "Sweet coconut sticky rice topped with fresh mango slices and a drizzle of coconut cream.",
    descriptionZh: "椰浆糯米饭配新鲜芒果片和椰奶。",
    price: 6.99,
    category: "Desserts",
    image: "/menu/mango-sticky-rice.jpg",
    spiceLevel: 0,
    allergens: [],
    isPopular: true,
    pairings: [],
  },
];

// ==========================================================================
// Search & Lookup Functions
// ==========================================================================

export function searchMenu(query: string): MenuItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return MENU_ITEMS;

  return MENU_ITEMS.filter((item) => {
    const searchable = [
      item.id,
      item.name,
      item.nameZh,
      item.description,
      item.descriptionZh,
      item.category,
    ]
      .join(" ")
      .toLowerCase();
    return searchable.includes(q);
  });
}

export function getMenuItem(id: string): MenuItem | undefined {
  return MENU_ITEMS.find((item) => item.id === id);
}

export function getMenuByCategory(category: string): MenuItem[] {
  return MENU_ITEMS.filter(
    (item) => item.category.toLowerCase() === category.toLowerCase()
  );
}

export function getPopularItems(): MenuItem[] {
  return MENU_ITEMS.filter((item) => item.isPopular);
}

export function getRecommendationsFor(itemId: string): MenuItem[] {
  const item = getMenuItem(itemId);
  if (!item) return [];
  return item.pairings
    .map((id) => getMenuItem(id))
    .filter((m): m is MenuItem => m !== undefined);
}
