export const categories = [
  "AI漫剧",
  "角色设定",
  "场景设定",
  "分镜制作",
  "短视频包装",
  "海报视觉",
] as const;

export type WorkCategory = (typeof categories)[number];

export type Work = {
  slug: string;
  title: string;
  category: WorkCategory;
  description: string;
  cover: string;
  featured?: boolean;
  videoUrl?: string;
  storyboardImages: string[];
  notes: string[];
};

const images = {
  hero: "/images/ai-comic-hero.png",
  character: "/images/ai-comic-character.png",
  storyboard: "/images/ai-comic-storyboard.png",
  studio: "/images/ai-comic-video-studio.png",
};

export const works: Work[] = [
  {
    slug: "rain-city-ai-comic",
    title: "雨城记忆 AI 漫剧企划",
    category: "AI漫剧",
    description:
      "围绕近未来雨夜城市展开的 AI 漫剧样例，展示世界观、角色关系、镜头氛围和短视频发布包装。",
    cover: images.hero,
    featured: true,
    videoUrl: "#",
    storyboardImages: [images.hero, images.storyboard, images.studio],
    notes: [
      "适合作为主页主推项目，承载账号的整体创作气质。",
      "内容可以替换为真实漫剧名称、集数封面、B 站或抖音视频链接。",
      "重点展示从故事概念到视觉封面再到视频发布的完整链路。",
    ],
  },
  {
    slug: "lead-character-design",
    title: "主角角色设定板",
    category: "角色设定",
    description:
      "用于 AI 漫剧主角包装的角色设定展示，包含轮廓、表情、服装气质和镜头适配方向。",
    cover: images.character,
    storyboardImages: [images.character, images.hero],
    notes: [
      "角色设定页适合展示人物关键词、服装变化和情绪状态。",
      "后续上传真实图片后，可以把这里替换成角色三视图、表情表和定妆图。",
    ],
  },
  {
    slug: "midnight-street-scene",
    title: "午夜街区场景设定",
    category: "场景设定",
    description:
      "为悬疑向 AI 漫剧准备的场景氛围稿，强调雨夜反光、玻璃层次和故事悬念。",
    cover: images.hero,
    storyboardImages: [images.hero, images.storyboard],
    notes: [
      "场景设定帮助观众快速进入漫剧世界，也方便统一账号封面风格。",
      "真实项目中可以补充提示词、生成过程和最终成片对照。",
    ],
  },
  {
    slug: "episode-storyboard-wall",
    title: "单集分镜节奏板",
    category: "分镜制作",
    description:
      "展示一集 AI 漫剧从开场、转折到结尾的镜头组织方式，适合作为创作过程内容。",
    cover: images.storyboard,
    storyboardImages: [images.storyboard, images.character, images.studio],
    notes: [
      "分镜类内容适合做成教程、幕后拆解或短视频系列。",
      "详情页保留图集结构，方便上传多张分镜图和关键帧。",
    ],
  },
  {
    slug: "vertical-video-package",
    title: "竖屏短视频包装",
    category: "短视频包装",
    description:
      "面向短视频平台的 AI 漫剧发布包装样例，覆盖封面、剪辑节奏、标题层级和预告片氛围。",
    cover: images.studio,
    videoUrl: "#",
    storyboardImages: [images.studio, images.storyboard],
    notes: [
      "上传后台可以放入真实视频素材，再把返回路径写入作品数据。",
      "适合展示账号运营、内容发布和系列化包装能力。",
    ],
  },
  {
    slug: "comic-poster-visual",
    title: "漫剧海报视觉实验",
    category: "海报视觉",
    description:
      "为 AI 漫剧账号准备的海报方向，占位展示主视觉、氛围图和社媒封面识别度。",
    cover: images.character,
    storyboardImages: [images.character, images.hero, images.studio],
    notes: [
      "海报视觉可以作为合集封面、预告海报或角色发布图。",
      "后续可上传真实海报，并按系列整理为项目档案。",
    ],
  },
];

export function getWorkBySlug(slug: string) {
  return works.find((work) => work.slug === slug);
}

export function getFeaturedWorks() {
  return works.filter((work) => work.featured);
}
