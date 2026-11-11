// The five main Unhinged Co. categories. Seeded once (only when the store has no categories yet,
// or when an admin clicks "Add default categories"). After that everything is edited from the admin.
const px = (id, width) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;

const make = (name, slug, description, photoId, sortOrder, seoDescription) => ({
  name,
  slug,
  description,
  image: px(photoId, 800),
  bannerImage: px(photoId, 1800),
  sortOrder,
  isActive: true,
  seoTitle: `${name} | Unhinged Co. Bangladesh`,
  seoDescription,
});

export const DEFAULT_CATEGORIES = [
  make('T-Shirts', 't-shirts', 'Premium everyday tees in heavyweight cotton, cut clean and made to last.', 8532616, 10,
    'Shop premium T-shirts in Bangladesh. Heavyweight cotton, clean fits and cash on delivery nationwide.'),
  make('Drop Shoulder', 'drop-shoulder', 'Relaxed drop-shoulder silhouettes with an easy, modern drape.', 4066293, 20,
    'Drop shoulder T-shirts with a relaxed modern fit. Premium cotton, delivered across Bangladesh.'),
  make('Hoodies', 'hoodies', 'Heavyweight fleece hoodies for cooler days and layered looks.', 19461586, 30,
    'Premium hoodies in heavyweight fleece. Shop minimalist hoodies with delivery across Bangladesh.'),
  make('Full Sleeves', 'full-sleeves', 'Long-sleeve tees that layer easily and wear well all season.', 8499111, 40,
    'Full sleeve T-shirts in premium cotton. Clean, versatile long-sleeve essentials for Bangladesh.'),
  make('Sweatshirts', 'sweatshirts', 'Soft, structured crewneck sweatshirts in a considered fit.', 2873063, 50,
    'Premium sweatshirts and crewnecks. Soft fabrics, considered fits, cash on delivery in Bangladesh.'),
];
