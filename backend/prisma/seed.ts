import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a default user
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: { name: 'Demo User', email: 'demo@example.com' },
  });

  // Create word books
  const cet4 = await prisma.wordBook.create({
    data: { name: '大学英语四级', description: 'CET-4 核心词汇', level: 'CET4' },
  });
  const cet6 = await prisma.wordBook.create({
    data: { name: '大学英语六级', description: 'CET-6 核心词汇', level: 'CET6' },
  });
  const kaoyan = await prisma.wordBook.create({
    data: { name: '考研英语', description: '考研英语核心词汇', level: 'KAOYAN' },
  });

  const cet4Words = [
    { word: 'abandon', phonetic: '/əˈbændən/', meaning: 'v. 放弃；遗弃', example: 'He abandoned his plan to travel abroad.' },
    { word: 'ability', phonetic: '/əˈbɪləti/', meaning: 'n. 能力；才能', example: 'She has the ability to learn languages quickly.' },
    { word: 'abroad', phonetic: '/əˈbrɔːd/', meaning: 'adv. 在国外；到国外', example: 'She plans to study abroad next year.' },
    { word: 'absent', phonetic: '/ˈæbsənt/', meaning: 'adj. 缺席的；不在的', example: 'He was absent from class yesterday.' },
    { word: 'absorb', phonetic: '/əbˈzɔːrb/', meaning: 'v. 吸收；吸引', example: 'Plants absorb carbon dioxide.' },
    { word: 'abstract', phonetic: '/ˈæbstrækt/', meaning: 'adj. 抽象的；n. 摘要', example: 'This is a very abstract concept.' },
    { word: 'abuse', phonetic: '/əˈbjuːs/', meaning: 'n./v. 滥用；虐待', example: 'The system is open to abuse.' },
    { word: 'academic', phonetic: '/ˌækəˈdemɪk/', meaning: 'adj. 学术的；学院的', example: 'She has a strong academic background.' },
    { word: 'accelerate', phonetic: '/əkˈseləreɪt/', meaning: 'v. 加速；促进', example: 'The car accelerated quickly.' },
    { word: 'accept', phonetic: '/əkˈsept/', meaning: 'v. 接受；承认', example: 'I accept your apology.' },
    { word: 'access', phonetic: '/ˈækses/', meaning: 'n. 进入；通道；v. 访问', example: 'You need a password to access the system.' },
    { word: 'accompany', phonetic: '/əˈkʌmpəni/', meaning: 'v. 陪伴；伴随', example: 'Let me accompany you to the airport.' },
    { word: 'accomplish', phonetic: '/əˈkɑːmplɪʃ/', meaning: 'v. 完成；实现', example: 'We accomplished our goal ahead of schedule.' },
    { word: 'account', phonetic: '/əˈkaʊnt/', meaning: 'n. 账户；描述；v. 解释', example: 'He gave a detailed account of the incident.' },
    { word: 'accumulate', phonetic: '/əˈkjuːmjəleɪt/', meaning: 'v. 积累；堆积', example: 'Dust accumulates quickly on the shelves.' },
    { word: 'accurate', phonetic: '/ˈækjərət/', meaning: 'adj. 准确的；精确的', example: 'The data is accurate and reliable.' },
    { word: 'achieve', phonetic: '/əˈtʃiːv/', meaning: 'v. 达到；取得', example: 'She achieved her dream of becoming a doctor.' },
    { word: 'acknowledge', phonetic: '/əkˈnɑːlɪdʒ/', meaning: 'v. 承认；致谢', example: 'He acknowledged his mistake.' },
    { word: 'acquaint', phonetic: '/əˈkweɪnt/', meaning: 'v. 使熟悉；使认识', example: 'Let me acquaint you with the rules.' },
    { word: 'acquire', phonetic: '/əˈkwaɪər/', meaning: 'v. 获得；学到', example: 'She acquired a good knowledge of English.' },
    { word: 'adapt', phonetic: '/əˈdæpt/', meaning: 'v. 适应；改编', example: 'You need to adapt to the new environment.' },
    { word: 'adequate', phonetic: '/ˈædɪkwət/', meaning: 'adj. 足够的；适当的', example: 'The supply is adequate for the demand.' },
    { word: 'adjust', phonetic: '/əˈdʒʌst/', meaning: 'v. 调整；适应', example: 'She adjusted the settings on the camera.' },
    { word: 'admire', phonetic: '/ədˈmaɪər/', meaning: 'v. 钦佩；欣赏', example: 'I admire your courage.' },
    { word: 'adopt', phonetic: '/əˈdɑːpt/', meaning: 'v. 采用；收养', example: 'The company adopted a new policy.' },
    { word: 'advance', phonetic: '/ədˈvæns/', meaning: 'v./n. 前进；进步', example: 'Technology has advanced rapidly.' },
    { word: 'advantage', phonetic: '/ədˈvæntɪdʒ/', meaning: 'n. 优势；有利条件', example: 'Being tall is an advantage in basketball.' },
    { word: 'advertise', phonetic: '/ˈædvərtaɪz/', meaning: 'v. 做广告；宣传', example: 'They advertised the product on TV.' },
    { word: 'affair', phonetic: '/əˈfer/', meaning: 'n. 事务；事件；私事', example: 'Mind your own affairs.' },
    { word: 'affect', phonetic: '/əˈfekt/', meaning: 'v. 影响；感动', example: 'The weather affects my mood.' },
    { word: 'afford', phonetic: '/əˈfɔːrd/', meaning: 'v. 负担得起；提供', example: 'I can afford to buy a new car.' },
    { word: 'aggressive', phonetic: '/əˈɡresɪv/', meaning: 'adj. 侵略的；好斗的；积极的', example: 'He is an aggressive salesman.' },
    { word: 'agree', phonetic: '/əˈɡriː/', meaning: 'v. 同意；一致', example: 'I agree with your opinion.' },
    { word: 'agriculture', phonetic: '/ˈæɡrɪkʌltʃər/', meaning: 'n. 农业；农学', example: 'Agriculture is the foundation of the economy.' },
    { word: 'allocate', phonetic: '/ˈæləkeɪt/', meaning: 'v. 分配；拨出', example: 'The government allocated funds for education.' },
    { word: 'allow', phonetic: '/əˈlaʊ/', meaning: 'v. 允许；准许', example: 'Smoking is not allowed here.' },
    { word: 'alternative', phonetic: '/ɔːlˈtɜːrnətɪv/', meaning: 'n. 替代物；adj. 替代的', example: 'We need to find an alternative solution.' },
    { word: 'amaze', phonetic: '/əˈmeɪz/', meaning: 'v. 使惊奇；使惊愕', example: 'Her performance amazed the audience.' },
    { word: 'ambition', phonetic: '/æmˈbɪʃn/', meaning: 'n. 雄心；野心', example: 'He has great ambitions for his career.' },
    { word: 'analysis', phonetic: '/əˈnæləsɪs/', meaning: 'n. 分析；解析', example: 'The analysis shows a significant trend.' },
    { word: 'ancestor', phonetic: '/ˈænsestər/', meaning: 'n. 祖先；祖宗', example: 'My ancestors came from China.' },
    { word: 'ancient', phonetic: '/ˈeɪnʃənt/', meaning: 'adj. 古代的；古老的', example: 'We visited an ancient temple.' },
    { word: 'announce', phonetic: '/əˈnaʊns/', meaning: 'v. 宣布；通告', example: 'They announced their engagement.' },
    { word: 'annual', phonetic: '/ˈænjuəl/', meaning: 'adj. 每年的；年度的', example: 'The annual meeting will be held in June.' },
    { word: 'anxiety', phonetic: '/æŋˈzaɪəti/', meaning: 'n. 焦虑；忧虑', example: 'He felt great anxiety before the exam.' },
    { word: 'apparent', phonetic: '/əˈpærənt/', meaning: 'adj. 明显的；表面上的', example: 'It is apparent that he is lying.' },
    { word: 'appeal', phonetic: '/əˈpiːl/', meaning: 'v./n. 呼吁；吸引；上诉', example: 'The idea appeals to young people.' },
    { word: 'appetite', phonetic: '/ˈæpɪtaɪt/', meaning: 'n. 食欲；胃口；欲望', example: 'I have a good appetite today.' },
    { word: 'appliance', phonetic: '/əˈplaɪəns/', meaning: 'n. 器具；器械', example: 'Kitchen appliances make cooking easier.' },
    { word: 'application', phonetic: '/ˌæplɪˈkeɪʃn/', meaning: 'n. 申请；应用；应用程序', example: 'I submitted my job application yesterday.' },
    { word: 'appoint', phonetic: '/əˈpɔɪnt/', meaning: 'v. 任命；约定', example: 'They appointed her as the new manager.' },
    { word: 'appreciate', phonetic: '/əˈpriːʃieɪt/', meaning: 'v. 欣赏；感激；领会', example: 'I appreciate your help.' },
    { word: 'approach', phonetic: '/əˈproʊtʃ/', meaning: 'v. 接近；n. 方法；途径', example: 'We need a new approach to solve this problem.' },
    { word: 'appropriate', phonetic: '/əˈproʊpriət/', meaning: 'adj. 适当的；合适的', example: 'Please dress appropriately for the occasion.' },
    { word: 'approve', phonetic: '/əˈpruːv/', meaning: 'v. 批准；赞成', example: 'The committee approved the plan.' },
    { word: 'arise', phonetic: '/əˈraɪz/', meaning: 'v. 出现；产生；升起', example: 'A new problem has arisen.' },
    { word: 'arrange', phonetic: '/əˈreɪndʒ/', meaning: 'v. 安排；整理', example: 'Can you arrange a meeting for us?' },
    { word: 'arrest', phonetic: '/əˈrest/', meaning: 'v./n. 逮捕；阻止', example: 'The police arrested the suspect.' },
    { word: 'artificial', phonetic: '/ˌɑːrtɪˈfɪʃl/', meaning: 'adj. 人工的；人造的', example: 'This juice contains artificial flavors.' },
    { word: 'aspect', phonetic: '/ˈæspekt/', meaning: 'n. 方面；层面', example: 'We need to consider every aspect of the problem.' },
    { word: 'assemble', phonetic: '/əˈsembl/', meaning: 'v. 集合；装配', example: 'The students assembled in the hall.' },
    { word: 'assess', phonetic: '/əˈses/', meaning: 'v. 评估；评定', example: 'The teacher assessed the students performance.' },
    { word: 'assign', phonetic: '/əˈsaɪn/', meaning: 'v. 分配；指定', example: 'Each student was assigned a task.' },
    { word: 'assist', phonetic: '/əˈsɪst/', meaning: 'v. 帮助；协助', example: 'Can you assist me with this project?' },
    { word: 'assume', phonetic: '/əˈsuːm/', meaning: 'v. 假设；承担；呈现', example: 'I assume you have finished the report.' },
    { word: 'atmosphere', phonetic: '/ˈætməsfɪr/', meaning: 'n. 大气；氛围', example: 'The restaurant has a cozy atmosphere.' },
    { word: 'attach', phonetic: '/əˈtætʃ/', meaning: 'v. 附上；连接；使依恋', example: 'Please attach your resume to the email.' },
    { word: 'attempt', phonetic: '/əˈtempt/', meaning: 'v./n. 尝试；企图', example: 'She attempted to solve the puzzle.' },
    { word: 'attend', phonetic: '/əˈtend/', meaning: 'v. 参加；出席；照料', example: 'Will you attend the meeting tomorrow?' },
    { word: 'attitude', phonetic: '/ˈætɪtuːd/', meaning: 'n. 态度；看法', example: 'His attitude towards work is positive.' },
    { word: 'attract', phonetic: '/əˈtrækt/', meaning: 'v. 吸引；引起', example: 'The museum attracts many visitors.' },
    { word: 'authority', phonetic: '/əˈθɔːrəti/', meaning: 'n. 权威；权力；当局', example: 'The local authorities are investigating.' },
    { word: 'available', phonetic: '/əˈveɪləbl/', meaning: 'adj. 可用的；有效的', example: 'Is this seat available?' },
    { word: 'average', phonetic: '/ˈævərɪdʒ/', meaning: 'n. 平均；adj. 平均的', example: 'His grades are above average.' },
    { word: 'avoid', phonetic: '/əˈvɔɪd/', meaning: 'v. 避免；回避', example: 'You should avoid making the same mistake.' },
    { word: 'aware', phonetic: '/əˈwer/', meaning: 'adj. 知道的；意识到的', example: 'Are you aware of the risks involved?' },
    { word: 'barrier', phonetic: '/ˈbæriər/', meaning: 'n. 障碍；屏障', example: 'Language can be a barrier to communication.' },
    { word: 'behave', phonetic: '/bɪˈheɪv/', meaning: 'v. 行为；表现；运转', example: 'The children behaved well at the party.' },
    { word: 'belief', phonetic: '/bɪˈliːf/', meaning: 'n. 信念；信仰；相信', example: 'He has a strong belief in justice.' },
    { word: 'benefit', phonetic: '/ˈbenɪfɪt/', meaning: 'n. 利益；v. 有益于', example: 'Regular exercise benefits your health.' },
    { word: 'blame', phonetic: '/bleɪm/', meaning: 'v./n. 责备；责怪', example: 'Don\'t blame others for your mistakes.' },
    { word: 'bother', phonetic: '/ˈbɑːðər/', meaning: 'v. 打扰；烦恼', example: 'I\'m sorry to bother you.' },
    { word: 'boundary', phonetic: '/ˈbaʊndəri/', meaning: 'n. 边界；界限', example: 'The river forms the boundary between the two countries.' },
    { word: 'brilliant', phonetic: '/ˈbrɪliənt/', meaning: 'adj. 卓越的；光辉的', example: 'She had a brilliant idea.' },
    { word: 'budget', phonetic: '/ˈbʌdʒɪt/', meaning: 'n. 预算；v. 做预算', example: 'We need to stay within our budget.' },
    { word: 'burden', phonetic: '/ˈbɜːrdn/', meaning: 'n. 负担；v. 使负担', example: 'He doesn\'t want to be a burden to his family.' },
  ];

  const cet6Words = [
    { word: 'abolish', phonetic: '/əˈbɑːlɪʃ/', meaning: 'v. 废除；废止', example: 'The government abolished the old tax system.' },
    { word: 'absurd', phonetic: '/əbˈsɜːrd/', meaning: 'adj. 荒谬的；可笑的', example: 'The idea seems absurd to me.' },
    { word: 'abundance', phonetic: '/əˈbʌndəns/', meaning: 'n. 丰富；充裕', example: 'The region has an abundance of natural resources.' },
    { word: 'academy', phonetic: '/əˈkædəmi/', meaning: 'n. 学院；研究院', example: 'He was elected to the Academy of Sciences.' },
    { word: 'accessory', phonetic: '/əkˈsesəri/', meaning: 'n. 配件；附件；同谋', example: 'The store sells fashion accessories.' },
    { word: 'accommodate', phonetic: '/əˈkɑːmədeɪt/', meaning: 'v. 容纳；向…提供住处', example: 'The hotel can accommodate up to 200 guests.' },
    { word: 'accountable', phonetic: '/əˈkaʊntəbl/', meaning: 'adj. 负有责任的', example: 'The manager is accountable for the results.' },
    { word: 'accumulation', phonetic: '/əˌkjuːmjəˈleɪʃn/', meaning: 'n. 积累；堆积物', example: 'The accumulation of wealth took years.' },
    { word: 'acquaintance', phonetic: '/əˈkweɪntəns/', meaning: 'n. 熟人；相识', example: 'He is just a casual acquaintance.' },
    { word: 'activate', phonetic: '/ˈæktɪveɪt/', meaning: 'v. 激活；使活动', example: 'This button activates the alarm system.' },
    { word: 'adhere', phonetic: '/ədˈhɪr/', meaning: 'v. 遵守；粘附', example: 'We must adhere to the rules.' },
    { word: 'administer', phonetic: '/ədˈmɪnɪstər/', meaning: 'v. 管理；执行', example: 'She administers the companys daily operations.' },
    { word: 'adolescent', phonetic: '/ˌædəˈlesnt/', meaning: 'n. 青少年；adj. 青春期的', example: 'Adolescent behavior can be challenging.' },
    { word: 'adverse', phonetic: '/ədˈvɜːrs/', meaning: 'adj. 不利的；有害的', example: 'The drug may have adverse side effects.' },
    { word: 'advocate', phonetic: '/ˈædvəkeɪt/', meaning: 'v. 提倡；n. 倡导者', example: 'She advocates for environmental protection.' },
    { word: 'aesthetic', phonetic: '/esˈθetɪk/', meaning: 'adj. 美学的；审美的', example: 'The design has both aesthetic and functional appeal.' },
    { word: 'affiliate', phonetic: '/əˈfɪlieɪt/', meaning: 'v. 使隶属；使加入', example: 'The college is affiliated with the university.' },
    { word: 'aggregate', phonetic: '/ˈæɡrɪɡət/', meaning: 'v./n. 总计；集合', example: 'The aggregate of all the data shows a clear trend.' },
    { word: 'allege', phonetic: '/əˈledʒ/', meaning: 'v. 声称；断言', example: 'The report alleged that the company was involved in fraud.' },
    { word: 'allocate', phonetic: '/ˈæləkeɪt/', meaning: 'v. 分配；拨出', example: 'Resources were allocated efficiently.' },
    { word: 'alternate', phonetic: '/ˈɔːltərnət/', meaning: 'v. 交替；adj. 交替的', example: 'The weather alternated between rain and sunshine.' },
    { word: 'ambiguous', phonetic: '/æmˈbɪɡjuəs/', meaning: 'adj. 模糊的；模棱两可的', example: 'The contract contains ambiguous language.' },
    { word: 'amend', phonetic: '/əˈmend/', meaning: 'v. 修正；修改', example: 'The constitution was amended in 1992.' },
    { word: 'ample', phonetic: '/ˈæmpl/', meaning: 'adj. 充足的；宽敞的', example: 'There is ample evidence to support the theory.' },
    { word: 'analogy', phonetic: '/əˈnælədʒi/', meaning: 'n. 类比；类推', example: 'The teacher drew an analogy between the heart and a pump.' },
    { word: 'anchor', phonetic: '/ˈæŋkər/', meaning: 'n. 锚；v. 抛锚；固定', example: 'She anchored the news broadcast.' },
    { word: 'anonymous', phonetic: '/əˈnɑːnɪməs/', meaning: 'adj. 匿名的；无名的', example: 'The donor wished to remain anonymous.' },
    { word: 'apparatus', phonetic: '/ˌæpəˈrætəs/', meaning: 'n. 仪器；设备；器官', example: 'The laboratory has modern apparatus.' },
    { word: 'applaud', phonetic: '/əˈplɔːd/', meaning: 'v. 鼓掌；称赞', example: 'The audience applauded warmly.' },
    { word: 'appraisal', phonetic: '/əˈpreɪzl/', meaning: 'n. 评价；评估', example: 'The annual performance appraisal is due next month.' },
    { word: 'articulate', phonetic: '/ɑːrˈtɪkjuleɪt/', meaning: 'adj. 表达清晰的；v. 明确表达', example: 'She is an articulate speaker.' },
    { word: 'ascend', phonetic: '/əˈsend/', meaning: 'v. 上升；攀登', example: 'The balloon ascended into the sky.' },
    { word: 'aspiration', phonetic: '/ˌæspəˈreɪʃn/', meaning: 'n. 渴望；抱负', example: 'She has aspirations to become a writer.' },
    { word: 'assassinate', phonetic: '/əˈsæsɪneɪt/', meaning: 'v. 暗杀；行刺', example: 'The plot to assassinate the leader was foiled.' },
    { word: 'assault', phonetic: '/əˈsɔːlt/', meaning: 'n./v. 攻击；袭击', example: 'He was charged with assault.' },
    { word: 'assert', phonetic: '/əˈsɜːrt/', meaning: 'v. 断言；主张；维护', example: 'He asserted his right to a fair trial.' },
    { word: 'assimilate', phonetic: '/əˈsɪməleɪt/', meaning: 'v. 吸收；同化', example: 'It takes time to assimilate new information.' },
    { word: 'auction', phonetic: '/ˈɔːkʃn/', meaning: 'n./v. 拍卖', example: 'The painting was sold at auction.' },
    { word: 'authentic', phonetic: '/ɔːˈθentɪk/', meaning: 'adj. 真正的；正宗的', example: 'The restaurant serves authentic Italian food.' },
    { word: 'autonomous', phonetic: '/ɔːˈtɑːnəməs/', meaning: 'adj. 自治的；自主的', example: 'The region is an autonomous province.' },
    { word: 'aviation', phonetic: '/ˌeɪviˈeɪʃn/', meaning: 'n. 航空；飞行', example: 'He works in the aviation industry.' },
    { word: 'bankrupt', phonetic: '/ˈbæŋkrʌpt/', meaning: 'adj. 破产的；v. 使破产', example: 'The company went bankrupt last year.' },
    { word: 'benchmark', phonetic: '/ˈbentʃmɑːrk/', meaning: 'n. 基准；标杆', example: 'This report provides a benchmark for comparison.' },
    { word: 'betray', phonetic: '/bɪˈtreɪ/', meaning: 'v. 背叛；泄露', example: 'He felt betrayed by his closest friend.' },
    { word: 'bewilder', phonetic: '/bɪˈwɪldər/', meaning: 'v. 使迷惑；使不知所措', example: 'The complex instructions bewildered the students.' },
    { word: 'bias', phonetic: '/ˈbaɪəs/', meaning: 'n. 偏见；v. 使有偏见', example: 'The news report showed a clear bias.' },
    { word: 'blossom', phonetic: '/ˈblɑːsəm/', meaning: 'n. 花；v. 开花；发展', example: 'Their friendship blossomed over time.' },
    { word: 'blueprint', phonetic: '/ˈbluːprɪnt/', meaning: 'n. 蓝图；计划', example: 'The architect drew up a blueprint for the building.' },
    { word: 'boost', phonetic: '/buːst/', meaning: 'v./n. 推动；提高', example: 'The new policy boosted the economy.' },
    { word: 'boycott', phonetic: '/ˈbɔɪkɑːt/', meaning: 'v./n. 抵制', example: 'They called for a boycott of the product.' },
    { word: 'breach', phonetic: '/briːtʃ/', meaning: 'v./n. 违反；破坏；突破', example: 'The company was sued for breach of contract.' },
    { word: 'brief', phonetic: '/briːf/', meaning: 'adj. 简短的；v. 简要介绍', example: 'The manager briefed the team on the new policy.' },
    { word: 'brisk', phonetic: '/brɪsk/', meaning: 'adj. 轻快的；兴隆的', example: 'The business is doing brisk trade.' },
    { word: 'bruise', phonetic: '/bruːz/', meaning: 'n. 瘀伤；v. 使受瘀伤', example: 'He bruised his knee when he fell.' },
    { word: 'bulletin', phonetic: '/ˈbʊlətɪn/', meaning: 'n. 公告；简报', example: 'The latest bulletin reported progress in the talks.' },
    { word: 'bureaucracy', phonetic: '/bjʊˈrɑːkrəsi/', meaning: 'n. 官僚主义；官僚机构', example: 'The bureaucracy slows down the process.' },
  ];

  // Create words for CET4
  await prisma.word.createMany({
    data: cet4Words.map((w) => ({ ...w, wordBookId: cet4.id })),
    skipDuplicates: true,
  });

  // Create words for CET6
  await prisma.word.createMany({
    data: cet6Words.map((w) => ({ ...w, wordBookId: cet6.id })),
    skipDuplicates: true,
  });

  // Add some words for 考研
  const kaoyanWords = [
    { word: 'abdomen', phonetic: '/ˈæbdəmən/', meaning: 'n. 腹部', example: 'He felt pain in his abdomen.' },
    { word: 'abide', phonetic: '/əˈbaɪd/', meaning: 'v. 遵守；忍受', example: 'You must abide by the rules.' },
    { word: 'abnormal', phonetic: '/æbˈnɔːrml/', meaning: 'adj. 反常的；变态的', example: 'The test results are abnormal.' },
    { word: 'abolish', phonetic: '/əˈbɑːlɪʃ/', meaning: 'v. 废除；取消', example: 'Slavery was abolished in the 19th century.' },
    { word: 'abortion', phonetic: '/əˈbɔːrʃn/', meaning: 'n. 流产；堕胎', example: 'The debate on abortion continues.' },
  ];

  await prisma.word.createMany({
    data: kaoyanWords.map((w) => ({ ...w, wordBookId: kaoyan.id })),
    skipDuplicates: true,
  });

  // Create some UserWord records for demo
  const words = await prisma.word.findMany({ take: 15 });
  for (let i = 0; i < words.length; i++) {
    const daysAgo = Math.floor(i / 3);
    const reviewInterval = [1, 2, 4, 7, 15][i % 5];
    const now = new Date();
    const lastReview = new Date(now.getTime() - daysAgo * 86400000);

    await prisma.userWord.create({
      data: {
        userId: user.id,
        wordId: words[i].id,
        status: i < 10 ? 'REVIEWING' : 'LEARNING',
        difficulty: (i % 5) + 1,
        stability: reviewInterval,
        reviewCount: i % 5 + 1,
        lastReviewAt: lastReview,
        nextReviewAt: new Date(
          now.getTime() + (i % 2 === 0 ? 0 : 1) * 86400000,
        ),
      },
    });
  }

  console.log('Seed data created successfully!');
  console.log(`- User: demo@example.com`);
  console.log(`- CET4 words: ${cet4Words.length}`);
  console.log(`- CET6 words: ${cet6Words.length}`);
  console.log(`- 考研 words: ${kaoyanWords.length}`);
  console.log(`- Demo UserWord records: ${words.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
