import { normalizeHumanText, sample, toDomainToken } from '../utils/domainUtils.js';

export const PROFESSION_PROFILES = [
  {
    profession: 'doctor',
    aliases: ['physician', 'gp', 'general practitioner', 'medical doctor'],
    services: ['clinic', 'medical', 'health', 'surgery', 'care', 'urgent care', 'primary care', 'family medicine'],
    brandRoots: ['vita', 'med', 'pulse', 'care']
  },
  {
    profession: 'lawyer',
    aliases: ['attorney', 'solicitor', 'barrister', 'legal counsel', 'advocate'],
    services: ['legal', 'law', 'attorney', 'justice', 'counsel', 'claims', 'rights', 'defense'],
    brandRoots: ['legal', 'law', 'civic', 'just']
  },
  {
    profession: 'dentist',
    aliases: ['orthodontist', 'dental surgeon', 'dental hygienist'],
    services: ['dental', 'smile', 'teeth', 'oral', 'braces', 'implants', 'whitening', 'dentistry'],
    brandRoots: ['smile', 'denta', 'oral', 'bright']
  },
  {
    profession: 'fitness',
    aliases: ['trainer', 'personal trainer', 'fitness coach', 'gym coach'],
    services: ['gym', 'training', 'coach', 'body', 'fit', 'wellness', 'strength', 'workout'],
    brandRoots: ['fit', 'body', 'move', 'strong']
  },
  {
    profession: 'tech',
    aliases: ['technology', 'developer', 'software engineer', 'programmer'],
    services: ['ai', 'software', 'app', 'cloud', 'dev', 'automation', 'data', 'platform'],
    brandRoots: ['nexa', 'cloud', 'byte', 'logic']
  },
  {
    profession: 'plumber',
    aliases: ['plumbing contractor', 'pipefitter'],
    services: ['plumbing', 'pipes', 'drain', 'water', 'leak', 'sewer', 'repair', 'flow'],
    brandRoots: ['flow', 'pipe', 'aqua', 'drain']
  },
  {
    profession: 'electrician',
    aliases: ['electrical contractor', 'wireman'],
    services: ['electric', 'wiring', 'power', 'lighting', 'panel', 'repair', 'energy', 'voltage'],
    brandRoots: ['volt', 'spark', 'power', 'wire']
  },
  {
    profession: 'roofer',
    aliases: ['roofing contractor', 'roof installer'],
    services: ['roof', 'roofing', 'shingles', 'gutters', 'repair', 'storm', 'home', 'cover'],
    brandRoots: ['roof', 'ridge', 'cover', 'summit']
  },
  {
    profession: 'contractor',
    aliases: ['general contractor', 'builder', 'construction contractor'],
    services: ['build', 'construction', 'renovation', 'remodel', 'home', 'project', 'crew', 'works'],
    brandRoots: ['build', 'craft', 'works', 'urban']
  },
  {
    profession: 'carpenter',
    aliases: ['woodworker', 'joiner', 'cabinet maker'],
    services: ['wood', 'cabinet', 'carpentry', 'trim', 'deck', 'custom', 'craft', 'build'],
    brandRoots: ['wood', 'craft', 'grain', 'deck']
  },
  {
    profession: 'painter',
    aliases: ['house painter', 'painting contractor'],
    services: ['paint', 'painting', 'color', 'coating', 'finish', 'walls', 'interior', 'exterior'],
    brandRoots: ['paint', 'color', 'fresh', 'finish']
  },
  {
    profession: 'landscaper',
    aliases: ['gardener', 'landscape designer', 'lawn care'],
    services: ['lawn', 'garden', 'landscape', 'yard', 'trees', 'turf', 'green', 'outdoor'],
    brandRoots: ['green', 'turf', 'yard', 'bloom']
  },
  {
    profession: 'cleaner',
    aliases: ['cleaning service', 'janitor', 'housekeeper', 'maid'],
    services: ['cleaning', 'clean', 'maids', 'janitorial', 'home', 'office', 'shine', 'fresh'],
    brandRoots: ['clean', 'shine', 'fresh', 'neat']
  },
  {
    profession: 'pest control',
    aliases: ['exterminator', 'pest technician'],
    services: ['pest', 'bugs', 'termite', 'rodent', 'control', 'exterminator', 'home', 'safe'],
    brandRoots: ['pest', 'guard', 'safe', 'home']
  },
  {
    profession: 'hvac',
    aliases: ['heating contractor', 'cooling contractor', 'air conditioning technician'],
    services: ['hvac', 'heating', 'cooling', 'air', 'climate', 'furnace', 'ac', 'comfort'],
    brandRoots: ['air', 'clima', 'comfort', 'cool']
  },
  {
    profession: 'locksmith',
    aliases: ['key maker', 'security locksmith'],
    services: ['lock', 'keys', 'security', 'unlock', 'door', 'safe', 'access', 'rapid'],
    brandRoots: ['lock', 'key', 'secure', 'access']
  },
  {
    profession: 'mover',
    aliases: ['moving company', 'relocation service'],
    services: ['moving', 'movers', 'relocation', 'packing', 'storage', 'delivery', 'haul', 'move'],
    brandRoots: ['move', 'haul', 'shift', 'pack']
  },
  {
    profession: 'mechanic',
    aliases: ['auto mechanic', 'car repair', 'automotive technician'],
    services: ['auto', 'car', 'repair', 'garage', 'engine', 'brake', 'tires', 'service'],
    brandRoots: ['auto', 'motor', 'drive', 'garage']
  },
  {
    profession: 'realtor',
    aliases: ['real estate agent', 'broker', 'property agent'],
    services: ['realty', 'homes', 'property', 'estate', 'broker', 'rentals', 'listing', 'homesale'],
    brandRoots: ['home', 'realty', 'estate', 'nest']
  },
  {
    profession: 'mortgage broker',
    aliases: ['loan officer', 'mortgage advisor'],
    services: ['mortgage', 'loans', 'lending', 'home loan', 'finance', 'rates', 'approval', 'funding'],
    brandRoots: ['loan', 'fund', 'rate', 'home']
  },
  {
    profession: 'accountant',
    aliases: ['cpa', 'chartered accountant', 'auditor'],
    services: ['accounting', 'tax', 'audit', 'books', 'payroll', 'finance', 'ledger', 'cpa'],
    brandRoots: ['ledger', 'tax', 'count', 'books']
  },
  {
    profession: 'bookkeeper',
    aliases: ['bookkeeping service', 'accounts clerk'],
    services: ['books', 'bookkeeping', 'ledger', 'payroll', 'receipts', 'billing', 'accounts', 'reports'],
    brandRoots: ['books', 'ledger', 'count', 'record']
  },
  {
    profession: 'tax advisor',
    aliases: ['tax preparer', 'tax consultant'],
    services: ['tax', 'refund', 'filing', 'irs', 'returns', 'planning', 'audit', 'relief'],
    brandRoots: ['tax', 'refund', 'file', 'relief']
  },
  {
    profession: 'financial advisor',
    aliases: ['wealth advisor', 'financial planner', 'investment advisor'],
    services: ['wealth', 'finance', 'invest', 'retirement', 'planning', 'money', 'assets', 'portfolio'],
    brandRoots: ['wealth', 'capital', 'asset', 'plan']
  },
  {
    profession: 'insurance agent',
    aliases: ['insurance broker', 'risk advisor'],
    services: ['insurance', 'coverage', 'policy', 'claims', 'risk', 'protection', 'quote', 'benefits'],
    brandRoots: ['cover', 'policy', 'safe', 'risk']
  },
  {
    profession: 'architect',
    aliases: ['building architect', 'design architect'],
    services: ['architecture', 'design', 'plans', 'studio', 'buildings', 'space', 'modern', 'drafting'],
    brandRoots: ['arch', 'plan', 'space', 'studio']
  },
  {
    profession: 'engineer',
    aliases: ['civil engineer', 'structural engineer', 'mechanical engineer'],
    services: ['engineering', 'design', 'systems', 'structural', 'civil', 'project', 'plans', 'consulting'],
    brandRoots: ['engine', 'struct', 'plan', 'systems']
  },
  {
    profession: 'interior designer',
    aliases: ['designer', 'decorator', 'home stylist'],
    services: ['design', 'interiors', 'decor', 'home', 'studio', 'style', 'space', 'rooms'],
    brandRoots: ['style', 'space', 'room', 'decor']
  },
  {
    profession: 'marketing agency',
    aliases: ['marketer', 'digital marketer', 'advertising agency'],
    services: ['marketing', 'ads', 'growth', 'brand', 'leads', 'media', 'campaigns', 'sales'],
    brandRoots: ['growth', 'brand', 'lead', 'media']
  },
  {
    profession: 'seo consultant',
    aliases: ['seo', 'search marketer', 'seo agency'],
    services: ['seo', 'ranking', 'search', 'traffic', 'content', 'leads', 'growth', 'analytics'],
    brandRoots: ['rank', 'search', 'traffic', 'grow']
  },
  {
    profession: 'photographer',
    aliases: ['photo studio', 'portrait photographer'],
    services: ['photo', 'portrait', 'wedding', 'studio', 'images', 'camera', 'shots', 'gallery'],
    brandRoots: ['photo', 'lens', 'studio', 'frame']
  },
  {
    profession: 'videographer',
    aliases: ['video producer', 'film maker'],
    services: ['video', 'film', 'media', 'wedding', 'production', 'studio', 'reels', 'motion'],
    brandRoots: ['video', 'film', 'motion', 'reel']
  },
  {
    profession: 'consultant',
    aliases: ['business consultant', 'advisor', 'strategy consultant'],
    services: ['consulting', 'strategy', 'advice', 'business', 'growth', 'solutions', 'operations', 'planning'],
    brandRoots: ['advice', 'strategy', 'growth', 'solve']
  },
  {
    profession: 'coach',
    aliases: ['life coach', 'business coach', 'mentor'],
    services: ['coach', 'coaching', 'mentor', 'goals', 'growth', 'life', 'career', 'success'],
    brandRoots: ['coach', 'mentor', 'rise', 'grow']
  },
  {
    profession: 'teacher',
    aliases: ['educator', 'instructor', 'trainer'],
    services: ['learning', 'class', 'school', 'education', 'lessons', 'study', 'academy', 'training'],
    brandRoots: ['learn', 'class', 'study', 'academy']
  },
  {
    profession: 'tutor',
    aliases: ['private tutor', 'academic tutor'],
    services: ['tutor', 'math', 'english', 'study', 'lessons', 'exam', 'learning', 'school'],
    brandRoots: ['tutor', 'study', 'learn', 'grade']
  },
  {
    profession: 'childcare',
    aliases: ['daycare', 'nanny', 'child care provider'],
    services: ['daycare', 'kids', 'childcare', 'nanny', 'learning', 'family', 'care', 'nursery'],
    brandRoots: ['kids', 'care', 'family', 'tiny']
  },
  {
    profession: 'veterinarian',
    aliases: ['vet', 'animal doctor', 'veterinary clinic'],
    services: ['vet', 'animal', 'pet', 'clinic', 'care', 'health', 'surgery', 'wellness'],
    brandRoots: ['pet', 'vet', 'care', 'paw']
  },
  {
    profession: 'therapist',
    aliases: ['counselor', 'mental health therapist'],
    services: ['therapy', 'counseling', 'mental health', 'wellness', 'care', 'support', 'healing', 'mind'],
    brandRoots: ['mind', 'care', 'calm', 'heal']
  },
  {
    profession: 'psychologist',
    aliases: ['clinical psychologist', 'mental health psychologist'],
    services: ['psychology', 'therapy', 'mind', 'mental health', 'counseling', 'assessment', 'care', 'wellness'],
    brandRoots: ['mind', 'psyche', 'calm', 'well']
  },
  {
    profession: 'chiropractor',
    aliases: ['chiro', 'spine doctor'],
    services: ['chiro', 'spine', 'back', 'adjustment', 'pain', 'wellness', 'care', 'posture'],
    brandRoots: ['spine', 'back', 'align', 'care']
  },
  {
    profession: 'physiotherapist',
    aliases: ['physical therapist', 'pt', 'rehab therapist'],
    services: ['physio', 'therapy', 'rehab', 'mobility', 'pain', 'sports', 'recovery', 'movement'],
    brandRoots: ['move', 'rehab', 'body', 'recover']
  },
  {
    profession: 'nurse',
    aliases: ['registered nurse', 'care nurse'],
    services: ['nursing', 'care', 'health', 'home care', 'clinic', 'wellness', 'patient', 'medical'],
    brandRoots: ['care', 'nurse', 'health', 'home']
  },
  {
    profession: 'surgeon',
    aliases: ['surgical doctor', 'specialist surgeon'],
    services: ['surgery', 'surgical', 'clinic', 'medical', 'specialist', 'care', 'procedure', 'health'],
    brandRoots: ['surg', 'med', 'care', 'clinic']
  },
  {
    profession: 'dermatologist',
    aliases: ['skin doctor', 'dermatology clinic'],
    services: ['skin', 'derm', 'laser', 'clinic', 'acne', 'care', 'beauty', 'aesthetics'],
    brandRoots: ['skin', 'derm', 'glow', 'care']
  },
  {
    profession: 'optometrist',
    aliases: ['eye doctor', 'optician'],
    services: ['eye', 'vision', 'glasses', 'optical', 'lens', 'care', 'clinic', 'sight'],
    brandRoots: ['vision', 'eye', 'lens', 'sight']
  },
  {
    profession: 'pharmacist',
    aliases: ['pharmacy', 'chemist'],
    services: ['pharmacy', 'meds', 'prescription', 'health', 'care', 'wellness', 'drugstore', 'clinic'],
    brandRoots: ['meds', 'pharma', 'care', 'health']
  },
  {
    profession: 'nutritionist',
    aliases: ['dietitian', 'dietician', 'health coach'],
    services: ['nutrition', 'diet', 'health', 'wellness', 'weight', 'meal', 'food', 'coach'],
    brandRoots: ['nutri', 'diet', 'well', 'body']
  },
  {
    profession: 'chef',
    aliases: ['private chef', 'cook'],
    services: ['chef', 'food', 'kitchen', 'cuisine', 'meals', 'private dining', 'catering', 'taste'],
    brandRoots: ['chef', 'taste', 'kitchen', 'meal']
  },
  {
    profession: 'caterer',
    aliases: ['catering company', 'event caterer'],
    services: ['catering', 'events', 'food', 'wedding', 'party', 'meals', 'banquet', 'taste'],
    brandRoots: ['cater', 'taste', 'feast', 'event']
  },
  {
    profession: 'baker',
    aliases: ['bakery', 'pastry chef'],
    services: ['bakery', 'cakes', 'bread', 'pastry', 'sweet', 'dessert', 'wedding', 'fresh'],
    brandRoots: ['bake', 'cake', 'sweet', 'fresh']
  },
  {
    profession: 'florist',
    aliases: ['flower shop', 'floral designer'],
    services: ['flowers', 'floral', 'bouquet', 'wedding', 'gifts', 'roses', 'plants', 'bloom'],
    brandRoots: ['bloom', 'floral', 'rose', 'petal']
  },
  {
    profession: 'barber',
    aliases: ['barbershop', 'mens groomer'],
    services: ['barber', 'cuts', 'fade', 'grooming', 'shave', 'hair', 'style', 'shop'],
    brandRoots: ['barber', 'cut', 'fade', 'style']
  },
  {
    profession: 'hairstylist',
    aliases: ['hair stylist', 'hairdresser', 'salon'],
    services: ['hair', 'salon', 'style', 'color', 'cuts', 'beauty', 'blowout', 'extensions'],
    brandRoots: ['hair', 'style', 'salon', 'glow']
  },
  {
    profession: 'makeup artist',
    aliases: ['mua', 'beauty artist'],
    services: ['makeup', 'beauty', 'bridal', 'glam', 'artist', 'studio', 'lashes', 'cosmetics'],
    brandRoots: ['glam', 'beauty', 'lash', 'style']
  },
  {
    profession: 'spa',
    aliases: ['esthetician', 'beauty spa'],
    services: ['spa', 'beauty', 'facial', 'skin', 'wellness', 'glow', 'massage', 'relax'],
    brandRoots: ['spa', 'glow', 'relax', 'skin']
  },
  {
    profession: 'massage therapist',
    aliases: ['masseuse', 'bodywork therapist'],
    services: ['massage', 'therapy', 'relax', 'pain', 'bodywork', 'wellness', 'sports', 'healing'],
    brandRoots: ['massage', 'relax', 'body', 'heal']
  },
  {
    profession: 'nail technician',
    aliases: ['nail artist', 'manicurist'],
    services: ['nails', 'manicure', 'pedicure', 'beauty', 'salon', 'gel', 'art', 'spa'],
    brandRoots: ['nail', 'glam', 'polish', 'spa']
  },
  {
    profession: 'tailor',
    aliases: ['seamstress', 'alterations'],
    services: ['tailor', 'alterations', 'suits', 'dress', 'custom', 'fit', 'clothing', 'stitch'],
    brandRoots: ['tailor', 'stitch', 'fit', 'suit']
  },
  {
    profession: 'jeweler',
    aliases: ['jewellery designer', 'gemologist'],
    services: ['jewelry', 'rings', 'diamonds', 'gems', 'repair', 'custom', 'gold', 'bridal'],
    brandRoots: ['jewel', 'gem', 'gold', 'ring']
  },
  {
    profession: 'travel agent',
    aliases: ['travel advisor', 'tour operator'],
    services: ['travel', 'trips', 'tours', 'vacation', 'cruise', 'flights', 'booking', 'holiday'],
    brandRoots: ['travel', 'trip', 'tour', 'voyage']
  },
  {
    profession: 'hotelier',
    aliases: ['hotel manager', 'hospitality'],
    services: ['hotel', 'stays', 'rooms', 'hospitality', 'booking', 'guest', 'resort', 'suite'],
    brandRoots: ['stay', 'suite', 'guest', 'hotel']
  },
  {
    profession: 'event planner',
    aliases: ['wedding planner', 'event coordinator'],
    services: ['events', 'wedding', 'planner', 'party', 'coordination', 'venue', 'decor', 'celebrate'],
    brandRoots: ['event', 'party', 'wed', 'venue']
  },
  {
    profession: 'security',
    aliases: ['security guard', 'security company'],
    services: ['security', 'guard', 'patrol', 'protection', 'alarm', 'surveillance', 'safe', 'monitoring'],
    brandRoots: ['secure', 'guard', 'safe', 'watch']
  },
  {
    profession: 'private investigator',
    aliases: ['detective', 'investigator'],
    services: ['investigation', 'detective', 'background', 'records', 'surveillance', 'claims', 'search', 'evidence'],
    brandRoots: ['detect', 'trace', 'proof', 'search']
  },
  {
    profession: 'translator',
    aliases: ['interpreter', 'translation service'],
    services: ['translation', 'language', 'interpreter', 'documents', 'localization', 'global', 'words', 'certified'],
    brandRoots: ['words', 'global', 'lingo', 'voice']
  },
  {
    profession: 'writer',
    aliases: ['copywriter', 'content writer'],
    services: ['writing', 'copy', 'content', 'blog', 'brand', 'words', 'story', 'editorial'],
    brandRoots: ['copy', 'words', 'story', 'write']
  },
  {
    profession: 'editor',
    aliases: ['proofreader', 'copy editor'],
    services: ['editing', 'proofreading', 'copy', 'content', 'books', 'words', 'polish', 'review'],
    brandRoots: ['edit', 'proof', 'words', 'polish']
  },
  {
    profession: 'web designer',
    aliases: ['website designer', 'ui designer'],
    services: ['web', 'design', 'sites', 'ux', 'ui', 'brand', 'digital', 'studio'],
    brandRoots: ['web', 'pixel', 'studio', 'design']
  },
  {
    profession: 'app developer',
    aliases: ['mobile developer', 'software developer'],
    services: ['app', 'mobile', 'software', 'dev', 'saas', 'platform', 'code', 'startup'],
    brandRoots: ['app', 'code', 'nexa', 'dev']
  },
  {
    profession: 'cybersecurity',
    aliases: ['security engineer', 'cyber security consultant'],
    services: ['cyber', 'security', 'audit', 'privacy', 'risk', 'compliance', 'network', 'defense'],
    brandRoots: ['cyber', 'secure', 'shield', 'audit']
  },
  {
    profession: 'data scientist',
    aliases: ['data analyst', 'analytics consultant'],
    services: ['data', 'analytics', 'ai', 'insights', 'dashboards', 'models', 'science', 'reports'],
    brandRoots: ['data', 'insight', 'model', 'logic']
  },
  {
    profession: 'cloud engineer',
    aliases: ['cloud architect', 'devops engineer'],
    services: ['cloud', 'devops', 'aws', 'azure', 'servers', 'automation', 'platform', 'infra'],
    brandRoots: ['cloud', 'infra', 'ops', 'deploy']
  },
  {
    profession: 'courier',
    aliases: ['delivery driver', 'messenger'],
    services: ['delivery', 'courier', 'same day', 'shipping', 'parcel', 'logistics', 'express', 'dispatch'],
    brandRoots: ['deliver', 'ship', 'parcel', 'dash']
  },
  {
    profession: 'logistics',
    aliases: ['freight broker', 'supply chain consultant'],
    services: ['logistics', 'freight', 'shipping', 'transport', 'warehouse', 'cargo', 'dispatch', 'supply'],
    brandRoots: ['freight', 'cargo', 'ship', 'supply']
  },
  {
    profession: 'farmer',
    aliases: ['grower', 'agriculture professional'],
    services: ['farm', 'agri', 'produce', 'organic', 'crops', 'market', 'fresh', 'harvest'],
    brandRoots: ['farm', 'grow', 'harvest', 'fresh']
  },
  {
    profession: 'welder',
    aliases: ['fabricator', 'metal worker'],
    services: ['welding', 'metal', 'fabrication', 'repair', 'steel', 'custom', 'industrial', 'mobile'],
    brandRoots: ['weld', 'metal', 'steel', 'forge']
  },
  {
    profession: 'machinist',
    aliases: ['cnc machinist', 'machine shop'],
    services: ['cnc', 'machining', 'machine', 'parts', 'precision', 'metal', 'tooling', 'shop'],
    brandRoots: ['cnc', 'parts', 'precision', 'tool']
  },
  {
    profession: 'manufacturer',
    aliases: ['factory', 'production company'],
    services: ['manufacturing', 'factory', 'production', 'parts', 'assembly', 'industrial', 'supply', 'maker'],
    brandRoots: ['make', 'factory', 'parts', 'supply']
  },
  {
    profession: 'driver',
    aliases: ['chauffeur', 'transport driver'],
    services: ['driver', 'ride', 'transport', 'chauffeur', 'car service', 'airport', 'shuttle', 'private'],
    brandRoots: ['ride', 'drive', 'shuttle', 'car']
  },
  {
    profession: 'pilot',
    aliases: ['aviator', 'flight instructor'],
    services: ['flight', 'aviation', 'pilot', 'charter', 'training', 'air', 'jet', 'travel'],
    brandRoots: ['fly', 'air', 'jet', 'flight']
  },
  {
    profession: 'musician',
    aliases: ['music teacher', 'performer', 'band'],
    services: ['music', 'lessons', 'band', 'studio', 'guitar', 'piano', 'events', 'sound'],
    brandRoots: ['music', 'sound', 'note', 'studio']
  },
  {
    profession: 'artist',
    aliases: ['visual artist', 'illustrator', 'painter artist'],
    services: ['art', 'studio', 'gallery', 'murals', 'illustration', 'design', 'custom', 'creative'],
    brandRoots: ['art', 'studio', 'canvas', 'create']
  },
  {
    profession: 'printer',
    aliases: ['print shop', 'printing service'],
    services: ['print', 'printing', 'signs', 'banners', 'cards', 'labels', 'graphics', 'promo'],
    brandRoots: ['print', 'sign', 'label', 'promo']
  },
  {
    profession: 'notary',
    aliases: ['notary public', 'mobile notary'],
    services: ['notary', 'documents', 'signing', 'legal', 'mobile', 'certified', 'forms', 'closing'],
    brandRoots: ['notary', 'sign', 'doc', 'legal']
  },
  {
    profession: 'immigration consultant',
    aliases: ['immigration lawyer', 'visa consultant'],
    services: ['immigration', 'visa', 'green card', 'citizenship', 'legal', 'forms', 'case', 'status'],
    brandRoots: ['visa', 'legal', 'status', 'case']
  },
  {
    profession: 'recruiter',
    aliases: ['talent recruiter', 'staffing agency'],
    services: ['recruiting', 'jobs', 'talent', 'staffing', 'hiring', 'careers', 'resume', 'workforce'],
    brandRoots: ['talent', 'jobs', 'hire', 'staff']
  },
  {
    profession: 'hr consultant',
    aliases: ['human resources consultant', 'people operations'],
    services: ['hr', 'payroll', 'benefits', 'hiring', 'compliance', 'people', 'workplace', 'training'],
    brandRoots: ['people', 'hr', 'work', 'talent']
  },
  {
    profession: 'restaurant',
    aliases: ['restaurateur', 'food business'],
    services: ['restaurant', 'food', 'dining', 'menu', 'delivery', 'kitchen', 'grill', 'table'],
    brandRoots: ['dine', 'table', 'grill', 'taste']
  },
  {
    profession: 'coffee shop',
    aliases: ['barista', 'cafe'],
    services: ['coffee', 'cafe', 'espresso', 'roast', 'beans', 'brew', 'breakfast', 'shop'],
    brandRoots: ['brew', 'coffee', 'bean', 'cafe']
  },
  {
    profession: 'pool service',
    aliases: ['pool cleaner', 'pool maintenance'],
    services: ['pool', 'cleaning', 'maintenance', 'spa', 'water', 'repair', 'service', 'clear'],
    brandRoots: ['pool', 'aqua', 'clear', 'water']
  },
  {
    profession: 'solar installer',
    aliases: ['solar contractor', 'renewable energy installer'],
    services: ['solar', 'energy', 'panels', 'power', 'green', 'battery', 'savings', 'install'],
    brandRoots: ['solar', 'energy', 'sun', 'green']
  },
  {
    profession: 'handyman',
    aliases: ['home repair', 'maintenance worker'],
    services: ['handyman', 'repair', 'home', 'fix', 'maintenance', 'install', 'small jobs', 'service'],
    brandRoots: ['fix', 'home', 'repair', 'handy']
  },
  {
    profession: 'appliance repair',
    aliases: ['appliance technician', 'repair technician'],
    services: ['appliance', 'repair', 'washer', 'dryer', 'fridge', 'oven', 'service', 'fix'],
    brandRoots: ['fix', 'repair', 'appliance', 'home']
  },
  {
    profession: 'garage door',
    aliases: ['garage door repair', 'door technician'],
    services: ['garage', 'doors', 'springs', 'opener', 'repair', 'install', 'home', 'service'],
    brandRoots: ['garage', 'door', 'spring', 'home']
  },
  {
    profession: 'towing',
    aliases: ['tow truck', 'roadside assistance'],
    services: ['towing', 'tow', 'roadside', 'recovery', 'truck', 'jumpstart', 'lockout', 'rapid'],
    brandRoots: ['tow', 'road', 'rapid', 'truck']
  },
  {
    profession: 'window cleaner',
    aliases: ['window washing', 'glass cleaner'],
    services: ['windows', 'glass', 'cleaning', 'shine', 'washing', 'commercial', 'home', 'view'],
    brandRoots: ['glass', 'shine', 'view', 'clean']
  },
  {
    profession: 'tree service',
    aliases: ['arborist', 'tree surgeon'],
    services: ['tree', 'arborist', 'trimming', 'removal', 'stump', 'landscape', 'storm', 'yard'],
    brandRoots: ['tree', 'arbor', 'yard', 'green']
  },
  {
    profession: 'wedding service',
    aliases: ['wedding vendor', 'bridal service'],
    services: ['wedding', 'bridal', 'events', 'venue', 'planner', 'photo', 'floral', 'celebrate'],
    brandRoots: ['wed', 'bride', 'event', 'vows']
  }
];

const GENERIC_SERVICE_TERMS = [
  'service',
  'pro',
  'expert',
  'hub',
  'center',
  'care',
  'solutions',
  'agency',
  'studio',
  'group',
  'works',
  'local'
];

const lookup = new Map();

for (const profile of PROFESSION_PROFILES) {
  const terms = [profile.profession, ...profile.aliases];
  for (const term of terms) {
    lookup.set(toLookupKey(term), profile);
  }
}

function toLookupKey(value) {
  return normalizeHumanText(value).toLowerCase();
}

function dedupeTerms(terms) {
  const seen = new Set();
  return terms
    .map((term) => normalizeHumanText(term).toLowerCase())
    .filter((term) => {
      const token = toDomainToken(term);
      if (!token || seen.has(token)) return false;
      seen.add(token);
      return true;
    });
}

export function findProfessionProfile(profession) {
  const key = toLookupKey(profession);
  if (!key) return null;
  if (lookup.has(key)) return lookup.get(key);

  const singular = key.endsWith('s') ? key.slice(0, -1) : key;
  if (lookup.has(singular)) return lookup.get(singular);

  for (const [term, profile] of lookup.entries()) {
    if (key.length >= 4 && (term.includes(key) || key.includes(term))) {
      return profile;
    }
  }

  return null;
}

export function createCustomProfessionProfile(profession) {
  const cleanProfession = normalizeHumanText(profession).toLowerCase() || 'service';
  const root = toDomainToken(cleanProfession) || 'service';

  return {
    profession: cleanProfession,
    aliases: [],
    services: dedupeTerms([
      cleanProfession,
      `${cleanProfession} service`,
      `${cleanProfession} expert`,
      `${cleanProfession} pro`,
      `${cleanProfession} care`,
      `${cleanProfession} solutions`,
      ...GENERIC_SERVICE_TERMS
    ]),
    brandRoots: dedupeTerms([root, 'pro', 'expert', 'local', 'prime'])
  };
}

export function resolveProfessionProfile(profession) {
  if (!profession) return null;
  return findProfessionProfile(profession) || createCustomProfessionProfile(profession);
}

export function getRandomProfessionProfiles(count = 12) {
  return sample(PROFESSION_PROFILES, Math.min(count, PROFESSION_PROFILES.length));
}

export function expandServiceTerms(profile) {
  if (!profile) return [];
  return dedupeTerms([
    profile.profession,
    ...(profile.aliases || []).slice(0, 3),
    ...(profile.services || []),
    ...(profile.brandRoots || [])
  ]);
}

export function expandBrandRoots(profile) {
  if (!profile) return GENERIC_SERVICE_TERMS;
  return dedupeTerms([...(profile.brandRoots || []), ...(profile.services || []).slice(0, 4)]);
}
