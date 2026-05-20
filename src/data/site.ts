export type Capability = {
  title: string;
  description: string;
};

export type ResourceLink = {
  title: string;
  description: string;
  url: string;
};

export type SiteSettings = {
  brandName: string;
  siteRole: string;
  metadataTitle: string;
  metadataDescription: string;
  navHomeLabel: string;
  navWorksLabel: string;
  navAdminLabel: string;
  heroEyebrow: string;
  heroDescription: string;
  heroMediaUrl: string;
  heroMediaType: "image" | "video";
  primaryCta: string;
  contactCta: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutParagraphs: string[];
  capabilitiesEyebrow: string;
  capabilitiesTitle: string;
  capabilities: Capability[];
  selectedEyebrow: string;
  selectedTitle: string;
  viewAllText: string;
  processEyebrow: string;
  processTitle: string;
  processSteps: string[];
  resourcesEyebrow: string;
  resourcesTitle: string;
  resourcesDescription: string;
  resources: ResourceLink[];
  categoryTitle: string;
  contactEyebrow: string;
  contactTitle: string;
  contactDescription: string;
  contactEmail: string;
  footerLeft: string;
  footerRight: string;
  worksArchiveEyebrow: string;
  worksArchiveTitle: string;
  worksArchiveDescription: string;
  detailBackText: string;
  detailVideoText: string;
  detailNotesEyebrow: string;
  detailNotesTitle: string;
  detailGalleryEyebrow: string;
  detailGalleryTitle: string;
  detailImageLabel: string;
};

export const defaultSiteSettings: SiteSettings = {
  brandName: "AI猿创意",
  siteRole: "AI 漫剧博主",
  metadataTitle: "AI猿创意 | AI 漫剧博主",
  metadataDescription:
    "高级、干净、电影感的 AI 漫剧博主个人主页，展示漫剧企划、角色设定、分镜与短视频作品。",
  navHomeLabel: "首页",
  navWorksLabel: "作品",
  navAdminLabel: "后台",
  heroEyebrow: "AI comic-drama creator / Storyboard / Video",
  heroDescription:
    "一位 AI 漫剧博主，专注角色设定、分镜制作、视觉封面和短视频包装。这里收纳漫剧企划、幕后过程和可持续更新的作品档案。",
  heroMediaUrl: "/images/ai-comic-hero.png",
  heroMediaType: "image",
  primaryCta: "浏览漫剧作品",
  contactCta: "合作联系",
  aboutEyebrow: "About",
  aboutTitle: "把 AI 漫剧做成可连续更新的内容系列",
  aboutParagraphs: [
    "这个主页首版使用占位内容，适合之后替换成你的真实账号名、头像、漫剧截图、角色图、分镜图和视频链接。当前结构优先服务作品浏览，也能承载合作介绍和幕后拆解。",
    "视觉方向延续深色电影感：大图建立账号气质，卡片承载不同漫剧项目，详情页负责展开每个企划的背景、过程、图片和视频入口。",
  ],
  capabilitiesEyebrow: "Capabilities",
  capabilitiesTitle: "能力方向",
  capabilities: [
    {
      title: "AI 漫剧企划",
      description: "把故事概念整理成角色、世界观、集数节奏和可发布的视觉包装。",
    },
    {
      title: "角色与分镜",
      description: "用角色设定、场景氛围和分镜节奏建立稳定的漫剧视觉语言。",
    },
    {
      title: "短视频发布",
      description: "为抖音、B 站、小红书等平台准备封面、预告和幕后拆解内容。",
    },
  ],
  selectedEyebrow: "Selected works",
  selectedTitle: "精选漫剧项目",
  viewAllText: "查看全部作品",
  processEyebrow: "Process",
  processTitle: "工作方式",
  processSteps: ["故事企划", "角色定调", "分镜成片", "发布包装"],
  resourcesEyebrow: "Resources",
  resourcesTitle: "公开资料",
  resourcesDescription:
    "这里可以放你的个人介绍、合作说明、作品集文件、公开视频资料或其他可公开下载的内容。",
  resources: [
    {
      title: "个人介绍",
      description: "适合放一份账号介绍、创作方向或合作简介。",
      url: "#",
    },
    {
      title: "合作说明",
      description: "用于说明可合作的内容类型、交付方式和联系方式。",
      url: "#",
    },
  ],
  categoryTitle: "分类浏览",
  contactEyebrow: "Contact",
  contactTitle: "一起做下一部 AI 漫剧",
  contactDescription:
    "用真实资料替换这里后，可以放上邮箱、B 站、抖音、小红书或合作说明。",
  contactEmail: "hello@example.com",
  footerLeft: "AI猿创意 / AI 漫剧博主",
  footerRight: "AI comic-drama, storyboard and short video works.",
  worksArchiveEyebrow: "Works archive",
  worksArchiveTitle: "漫剧作品档案",
  worksArchiveDescription:
    "汇集 AI 漫剧企划、角色设定、场景设定、分镜制作、短视频包装和海报视觉。每个作品都可以继续替换为真实内容。",
  detailBackText: "返回作品档案",
  detailVideoText: "打开视频链接",
  detailNotesEyebrow: "Creative notes",
  detailNotesTitle: "创作说明",
  detailGalleryEyebrow: "Visuals",
  detailGalleryTitle: "作品画面",
  detailImageLabel: "Image",
};
