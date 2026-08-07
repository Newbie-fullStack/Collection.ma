export interface BlogArticle {
  id: number;
  slug: string;
  title: string;
  title_ar: string;
  excerpt: string;
  excerpt_ar: string;
  content: string;
  content_ar: string;
  category: string;
  category_ar: string;
  date: string;
  readTime: number;
}

export const articles: BlogArticle[] = [
  {
    id: 1,
    slug: 'guide-acheteur-debutant',
    title: 'Guide de l\'acheteur débutant',
    title_ar: 'دليل المشتري المبتدئ',
    excerpt: 'Tout ce que vous devez savoir pour commencer à collectionner sur Collection.ma',
    excerpt_ar: 'كل ما تحتاج معرفته للبدء في الجمع على Collection.ma',
    content: 'Commencez par explorer les catégories qui vous passionnent. Créez votre compte, alimentez votre portefeuille et utilisez la recherche avancée pour affiner vos résultats. Suivez les enchères qui vous intéressent et n\'hésitez pas à contacter les vendeurs avant d\'enchérir. Vérifiez toujours la réputation du vendeur et les photos de l\'objet. La protection escrow garantit que vos fonds ne sont libérés qu\'après réception confirmée de l\'objet.',
    content_ar: 'ابدأ باستكشاف الفئات التي تهمك. أنشئ حسابك، وقم بتعبئة محفظتك، واستخدم البحث المتقدم لتحسين النتائج. تابع المزايدات التي تهمك ولا تتردد في التواصل مع البائعين قبل المزايدة. تحقق دائماً من سمعة البائع وصور السلعة. يضمن نظام الحجز عدم تحرير أموالك إلا بعد تأكيد استلام السلعة.',
    category: 'Guide',
    category_ar: 'دليل',
    date: '2026-07-15',
    readTime: 5,
  },
  {
    id: 2,
    slug: 'comment-vendre-efficientement',
    title: 'Comment vendre efficacement',
    title_ar: 'كيفية البيع بكفاءة',
    excerpt: 'Nos conseils pour optimiser vos annonces et vendre plus vite',
    excerpt_ar: 'نصائحنا لتحسين إعلاناتك والبيع بشكل أسرع',
    content: 'Des photos de qualité et un titre clair augmentent considérablement vos chances de vente. Décrivez l\'état, l\'origine et la provenance de l\'objet. Fixez un prix de départ réaliste et choisissez un frais de port compétitif. Répondez rapidement aux questions des acheteurs et expédiez dans les délais annoncés. Un vendeur fiable construit une réputation qui attire plus d\'acheteurs.',
    content_ar: 'الصور عالية الجودة والعنوان الواضح يزيدان بشكل كبير من فرص البيع. صف الحالة والأصل ومصدر السلعة. حدد سعراً ابتدائياً واقعياً واختر تكلفة شحن منافسة. أجب بسرعة على أسئلة المشترين وقم بالشحن في المواعيد المعلنة. البائع الموثوق يبني سمعة تجذب المزيد من المشترين.',
    category: 'Vendeur',
    category_ar: 'بائع',
    date: '2026-07-10',
    readTime: 7,
  },
  {
    id: 3,
    slug: 'systeme-escrow-explication',
    title: 'Le système escrow expliqué',
    title_ar: 'شرح نظام الحجز',
    excerpt: 'Comment fonctionne la protection des paiements et pourquoi c\'est sûr',
    excerpt_ar: 'كيف تعمل حماية المدفوعات ولماذا هي آمنة',
    content: 'Le système escrow sécurise chaque transaction. Lorsque vous achetez, les fonds sont retenus en toute sécurité par la plateforme. Le vendeur expédie l\'objet et, une fois que vous confirmez la réception, les fonds sont libérés au vendeur après déduction de la commission. En cas de litige, notre équipe intervient pour protéger les deux parties.',
    content_ar: 'نظام الحجز يؤمن كل معاملة. عند الشراء، يتم الاحتفاظ بالأموال بأمان من قبل المنصة. يقوم البائع بشحن السلعة، وبمجرد تأكيد الاستلام، يتم تحرير الأموال للبائع بعد خصم العمولة. في حالة وجود نزاع، يتدخل فريقنا لحماية الطرفين.',
    category: 'Paiement',
    category_ar: 'دفع',
    date: '2026-07-05',
    readTime: 4,
  },
  {
    id: 4,
    slug: 'top-10-categories-collection',
    title: 'Top 10 des catégories de collection',
    title_ar: 'أفضل 10 فئات للجمع',
    excerpt: 'Découvrez les catégories les plus populaires et leurs pièces les plus recherchées',
    excerpt_ar: 'اكتشف الفئات الأكثر شعبية وأكثر قطع طلباً',
    content: 'Les monnaies anciennes, les timbres, les cartes Pokémon et les voitures miniatures figurent parmi les catégories les plus populaires. Les pièces rares en bon état peuvent atteindre des valeurs impressionnantes. Rejoignez les communautés de collectionneurs pour échanger des conseils et découvrir des pièces exceptionnelles.',
    content_ar: 'العملات القديمة والطوابع وكروت البوكيمون والسيارات المصغرة من بين الفئات الأكثر شعبية. القطع النادرة بحالة جيدة يمكن أن تصل إلى قيم مذهلة. انضم إلى مجتمعات الجامعين لتبادل النصائح واكتشاف قطع استثنائية.',
    category: 'Collection',
    category_ar: 'جمع',
    date: '2026-06-28',
    readTime: 6,
  },
  {
    id: 5,
    slug: 'authentifier-timbres-marocains',
    title: 'Comment authentifier les timbres marocains',
    title_ar: 'كيفية التحقق من أصالة الطوابع المغربية',
    excerpt: 'Les clés pour reconnaître les timbres authentiques et éviter les contrefaçons',
    excerpt_ar: 'المفاتيح للتعرف على الطوابع الأصلية وتجنب التزوير',
    content: 'Examinez la qualité d\'impression, la dentelure et le type de papier. Les timbres authentiques présentent des détails nets et des couleurs vives. Comparez avec des références certifiées et méfiez-vous des prix trop bas. En cas de doute, demandez une expertise professionnelle avant d\'acheter.',
    content_ar: 'افحص جودة الطباعة والتسنين ونوع الورق. الطوابع الأصلية تتميز بتفاصيل واضحة وألوان زاهية. قارن مع مراجع معتمدة واحذر من الأسعار المنخفضة جداً. عند الشك، اطلب خبرة مهنية قبل الشراء.',
    category: 'Authenticité',
    category_ar: 'أصالة',
    date: '2026-06-20',
    readTime: 8,
  },
  {
    id: 6,
    slug: 'preparer-colis-expedition',
    title: 'Préparer un colis pour l\'expédition',
    title_ar: 'تحضير طرد للشحن',
    excerpt: 'Guide pratique pour emballer vos objets de collection en toute sécurité',
    excerpt_ar: 'دليل عملي لتعبئة أغراضك بأمان',
    content: 'Utilisez un emballage renforcé, du papier bulle et des cartons adaptés à la taille de l\'objet. Protégez les objets fragiles avec plusieurs couches. Incluez une facture et le numéro de suivi. Photographiez le colis avant l\'envoi pour garder une preuve en cas de litige.',
    content_ar: 'استخدم تغليفاً مقوى وورق فقاعات وكرتوناً مناسباً لحجم السلعة. احمِ الأغراض الهشة بعدة طبقات. أدرج فاتورة ورقم التتبع. صوّر الطرد قبل الإرسال للاحتفاظ بدليل في حالة وجود نزاع.',
    category: 'Livraison',
    category_ar: 'توصيل',
    date: '2026-06-15',
    readTime: 5,
  },
];