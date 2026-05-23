import { MARKET_SEGMENTS } from './marketSignals.js';
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
    profession: 'personal injury lawyer',
    aliases: ['injury lawyer', 'injurylawyer', 'accident lawyer', 'injury attorney', 'personal injury attorney'],
    services: ['injury', 'accident', 'claims', 'compensation', 'legal', 'attorney', 'settlement', 'justice'],
    brandRoots: ['injury', 'claim', 'legal', 'justice']
  },
  {
    profession: 'divorce lawyer',
    aliases: ['divorcelawyer', 'divorce attorney', 'separation lawyer'],
    services: ['divorce', 'family law', 'custody', 'support', 'legal', 'attorney', 'mediation', 'settlement'],
    brandRoots: ['divorce', 'family', 'legal', 'case']
  },
  {
    profession: 'criminal lawyer',
    aliases: ['criminallawyer', 'criminal attorney', 'defense lawyer', 'criminal defense attorney'],
    services: ['criminal', 'defense', 'legal', 'attorney', 'court', 'charges', 'rights', 'justice'],
    brandRoots: ['defense', 'legal', 'rights', 'court']
  },
  {
    profession: 'bankruptcy lawyer',
    aliases: ['bankruptcy', 'bankruptcy attorney', 'debt lawyer'],
    services: ['bankruptcy', 'debt', 'relief', 'credit', 'legal', 'attorney', 'chapter', 'fresh start'],
    brandRoots: ['debt', 'relief', 'legal', 'fresh']
  },
  {
    profession: 'tax lawyer',
    aliases: ['taxlawyer', 'tax attorney', 'tax law'],
    services: ['tax', 'irs', 'audit', 'relief', 'legal', 'attorney', 'debt', 'appeals'],
    brandRoots: ['tax', 'legal', 'relief', 'audit']
  },
  {
    profession: 'family law',
    aliases: ['familylaw', 'family lawyer', 'family attorney'],
    services: ['family law', 'custody', 'divorce', 'support', 'legal', 'attorney', 'mediation', 'case'],
    brandRoots: ['family', 'legal', 'case', 'care']
  },
  {
    profession: 'estate planning',
    aliases: ['estateplanning', 'estate lawyer', 'wills and trusts'],
    services: ['estate', 'wills', 'trusts', 'probate', 'legacy', 'planning', 'legal', 'assets'],
    brandRoots: ['estate', 'legacy', 'trust', 'plan']
  },
  {
    profession: 'psychiatrist',
    aliases: ['mental health doctor', 'psychiatry clinic'],
    services: ['psychiatry', 'mental health', 'therapy', 'medication', 'mind', 'wellness', 'care', 'clinic'],
    brandRoots: ['mind', 'care', 'calm', 'well']
  },
  {
    profession: 'pediatrician',
    aliases: ['child doctor', 'pediatric clinic'],
    services: ['pediatric', 'kids', 'children', 'clinic', 'health', 'care', 'family', 'wellness'],
    brandRoots: ['kids', 'care', 'child', 'health']
  },
  {
    profession: 'cardiologist',
    aliases: ['heart doctor', 'cardiology clinic'],
    services: ['heart', 'cardio', 'clinic', 'vascular', 'health', 'care', 'screening', 'wellness'],
    brandRoots: ['heart', 'cardio', 'pulse', 'care']
  },
  {
    profession: 'neurologist',
    aliases: ['brain doctor', 'neurology clinic'],
    services: ['neuro', 'brain', 'nerves', 'clinic', 'health', 'care', 'spine', 'specialist'],
    brandRoots: ['neuro', 'brain', 'nerve', 'care']
  },
  {
    profession: 'gynecologist',
    aliases: ['obgyn', 'women doctor', 'womens health clinic'],
    services: ['obgyn', 'women', 'clinic', 'health', 'care', 'pregnancy', 'wellness', 'medical'],
    brandRoots: ['women', 'care', 'health', 'clinic']
  },
  {
    profession: 'urgent care',
    aliases: ['urgentcare', 'walk in clinic', 'rapid clinic'],
    services: ['urgent', 'clinic', 'walk in', 'medical', 'health', 'care', 'rapid', 'same day'],
    brandRoots: ['urgent', 'rapid', 'clinic', 'care']
  },
  {
    profession: 'pain clinic',
    aliases: ['painclinic', 'pain management', 'pain doctor'],
    services: ['pain', 'clinic', 'relief', 'spine', 'therapy', 'care', 'management', 'recovery'],
    brandRoots: ['pain', 'relief', 'spine', 'care']
  },
  {
    profession: 'med spa',
    aliases: ['medspa', 'medical spa', 'aesthetic clinic'],
    services: ['medspa', 'aesthetics', 'skin', 'laser', 'beauty', 'injectables', 'glow', 'spa'],
    brandRoots: ['glow', 'skin', 'spa', 'aesthetic']
  },
  {
    profession: 'dental implants',
    aliases: ['dentalimplants', 'implant dentist'],
    services: ['implants', 'dental', 'smile', 'teeth', 'oral', 'restoration', 'clinic', 'care'],
    brandRoots: ['implant', 'smile', 'dental', 'oral']
  },
  {
    profession: 'remodeler',
    aliases: ['home remodeler', 'remodeling contractor'],
    services: ['remodel', 'renovation', 'home', 'kitchen', 'bath', 'build', 'design', 'upgrade'],
    brandRoots: ['remodel', 'home', 'build', 'upgrade']
  },
  {
    profession: 'flooring',
    aliases: ['flooring installer', 'flooring contractor'],
    services: ['flooring', 'floors', 'tile', 'wood', 'vinyl', 'install', 'repair', 'home'],
    brandRoots: ['floor', 'tile', 'wood', 'home']
  },
  {
    profession: 'concrete',
    aliases: ['concrete contractor', 'cement contractor'],
    services: ['concrete', 'cement', 'driveway', 'patio', 'slab', 'repair', 'foundation', 'paving'],
    brandRoots: ['concrete', 'cement', 'pave', 'slab']
  },
  {
    profession: 'pool builder',
    aliases: ['poolbuilder', 'pool contractor', 'pool installer'],
    services: ['pool', 'builder', 'swimming', 'spa', 'water', 'backyard', 'design', 'install'],
    brandRoots: ['pool', 'aqua', 'water', 'spa']
  },
  {
    profession: 'property manager',
    aliases: ['propertymanager', 'rental manager', 'property management'],
    services: ['property', 'rentals', 'management', 'tenant', 'leasing', 'maintenance', 'realty', 'homes'],
    brandRoots: ['property', 'rent', 'home', 'manage']
  },
  {
    profession: 'home inspector',
    aliases: ['homeinspector', 'property inspector'],
    services: ['inspection', 'home', 'property', 'report', 'mold', 'roof', 'safety', 'buyer'],
    brandRoots: ['inspect', 'home', 'report', 'safe']
  },
  {
    profession: 'auto repair',
    aliases: ['autorepair', 'car repair shop', 'auto shop'],
    services: ['auto', 'repair', 'garage', 'engine', 'brake', 'service', 'diagnostic', 'mechanic'],
    brandRoots: ['auto', 'repair', 'garage', 'motor']
  },
  {
    profession: 'body shop',
    aliases: ['bodyshop', 'collision repair', 'auto body'],
    services: ['body shop', 'collision', 'paint', 'repair', 'auto', 'dent', 'bumper', 'restore'],
    brandRoots: ['body', 'auto', 'paint', 'restore']
  },
  {
    profession: 'car dealer',
    aliases: ['cardealer', 'auto dealer', 'used cars'],
    services: ['cars', 'dealer', 'auto', 'sales', 'used cars', 'finance', 'trade', 'drive'],
    brandRoots: ['cars', 'auto', 'drive', 'dealer']
  },
  {
    profession: 'tire shop',
    aliases: ['tireshop', 'tyre shop', 'tire service'],
    services: ['tires', 'wheels', 'alignment', 'brakes', 'auto', 'service', 'repair', 'shop'],
    brandRoots: ['tire', 'wheel', 'auto', 'drive']
  },
  {
    profession: 'car wash',
    aliases: ['carwash', 'auto detailing', 'detailing service'],
    services: ['car wash', 'detail', 'auto', 'clean', 'shine', 'ceramic', 'wax', 'mobile'],
    brandRoots: ['wash', 'detail', 'shine', 'auto']
  },
  {
    profession: 'mobile mechanic',
    aliases: ['mobilemechanic', 'mobile auto repair'],
    services: ['mobile mechanic', 'auto', 'repair', 'diagnostic', 'roadside', 'brake', 'engine', 'service'],
    brandRoots: ['mobile', 'auto', 'repair', 'road']
  },
  {
    profession: 'nail salon',
    aliases: ['nailsalon', 'nails', 'manicure salon'],
    services: ['nails', 'salon', 'manicure', 'pedicure', 'gel', 'spa', 'beauty', 'polish'],
    brandRoots: ['nail', 'salon', 'glam', 'spa']
  },
  {
    profession: 'tattoo artist',
    aliases: ['tattooartist', 'tattoo shop'],
    services: ['tattoo', 'ink', 'artist', 'studio', 'custom', 'piercing', 'design', 'art'],
    brandRoots: ['ink', 'tattoo', 'art', 'studio']
  },
  {
    profession: 'graphic designer',
    aliases: ['graphicdesigner', 'brand designer', 'logo designer'],
    services: ['graphics', 'design', 'logo', 'brand', 'creative', 'studio', 'print', 'visual'],
    brandRoots: ['design', 'brand', 'logo', 'pixel']
  },
  {
    profession: 'driving school',
    aliases: ['drivingschool', 'driving instructor'],
    services: ['driving', 'lessons', 'school', 'driver', 'training', 'license', 'road', 'test'],
    brandRoots: ['drive', 'road', 'learn', 'license']
  },
  {
    profession: 'food truck',
    aliases: ['foodtruck', 'mobile food'],
    services: ['food truck', 'street food', 'catering', 'events', 'mobile', 'grill', 'taste', 'meals'],
    brandRoots: ['food', 'truck', 'taste', 'grill']
  },
  {
    profession: 'junk removal',
    aliases: ['junkremoval', 'hauling service'],
    services: ['junk', 'removal', 'haul', 'cleanout', 'trash', 'debris', 'pickup', 'moving'],
    brandRoots: ['junk', 'haul', 'clear', 'clean']
  },
  {
    profession: 'pressure washing',
    aliases: ['pressurewashing', 'power washing'],
    services: ['pressure', 'washing', 'power wash', 'cleaning', 'driveway', 'house', 'deck', 'exterior'],
    brandRoots: ['wash', 'clean', 'power', 'shine']
  },
  {
    profession: 'storage',
    aliases: ['self storage', 'storage units'],
    services: ['storage', 'units', 'moving', 'secure', 'space', 'warehouse', 'boxes', 'rental'],
    brandRoots: ['store', 'space', 'secure', 'unit']
  },
  {
    profession: 'it services',
    aliases: ['itservices', 'tech support', 'computer support'],
    services: ['it', 'support', 'network', 'computers', 'helpdesk', 'security', 'cloud', 'service'],
    brandRoots: ['it', 'tech', 'support', 'network']
  },
  {
    profession: 'managed it',
    aliases: ['managedit', 'managed services provider', 'msp'],
    services: ['managed it', 'msp', 'support', 'network', 'security', 'cloud', 'helpdesk', 'monitoring'],
    brandRoots: ['managed', 'it', 'secure', 'cloud']
  },
  {
    profession: 'saas consultant',
    aliases: ['saas', 'saas agency', 'software as a service'],
    services: ['saas', 'software', 'platform', 'app', 'cloud', 'automation', 'startup', 'growth'],
    brandRoots: ['saas', 'cloud', 'app', 'scale']
  },
  {
    profession: 'automation agency',
    aliases: ['automation', 'workflow automation', 'process automation'],
    services: ['automation', 'workflow', 'process', 'ai', 'systems', 'integration', 'ops', 'scale'],
    brandRoots: ['auto', 'flow', 'ops', 'scale']
  },
  {
    profession: 'ai agency',
    aliases: ['aiagency', 'ai consultant', 'aiconsultant'],
    services: ['ai', 'automation', 'agents', 'chatbot', 'machine learning', 'software', 'data', 'workflow'],
    brandRoots: ['ai', 'agent', 'data', 'logic']
  },
  {
    profession: 'lead generation',
    aliases: ['leadgeneration', 'lead gen', 'lead generation agency'],
    services: ['leads', 'lead gen', 'appointments', 'sales', 'growth', 'marketing', 'pipeline', 'conversion'],
    brandRoots: ['leads', 'growth', 'sales', 'pipeline']
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
let lastRandomMarketSegmentKey = '';

for (const profile of PROFESSION_PROFILES) {
  const terms = [profile.profession, ...profile.aliases];
  for (const term of terms) {
    for (const key of toLookupKeys(term)) {
      lookup.set(key, profile);
    }
  }
}

function toLookupKey(value) {
  return normalizeHumanText(value).toLowerCase();
}

function toLookupKeys(value) {
  const normalized = toLookupKey(value);
  const compact = toDomainToken(value);
  return [...new Set([normalized, compact].filter(Boolean))];
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
  const keys = toLookupKeys(profession);
  if (!keys.length) return null;

  for (const key of keys) {
    if (lookup.has(key)) return lookup.get(key);

    const singular = key.endsWith('s') ? key.slice(0, -1) : key;
    if (lookup.has(singular)) return lookup.get(singular);
  }

  for (const key of keys) {
    for (const [term, profile] of lookup.entries()) {
      if (key.length >= 4 && (term.includes(key) || key.includes(term))) {
        return profile;
      }
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

export function getSupportedMarketSegments() {
  return MARKET_SEGMENTS.filter((segment) => segment.key !== 'default_local').map((segment) => segment.key);
}

export function getRandomMarketSegmentKey() {
  const segmentKeys = getSupportedMarketSegments();
  const availableKeys = segmentKeys.length > 1 ? segmentKeys.filter((key) => key !== lastRandomMarketSegmentKey) : segmentKeys;
  const selectedKey = sample(availableKeys, 1)[0] || segmentKeys[0] || 'default_local';
  lastRandomMarketSegmentKey = selectedKey;
  return selectedKey;
}

export function getProfessionProfilesByMarketSegment(marketSegmentKey, count = 12) {
  const segment = MARKET_SEGMENTS.find((item) => item.key === marketSegmentKey);
  if (!segment || segment.key === 'default_local') {
    return getRandomProfessionProfiles(count);
  }

  const segmentTerms = segment.terms.map((term) => toDomainToken(term)).filter(Boolean);
  const matchingProfiles = PROFESSION_PROFILES.filter((profile) => {
    const profileTerms = [
      profile.profession,
      ...(profile.aliases || []),
      ...(profile.services || []),
      ...(profile.brandRoots || [])
    ]
      .map((term) => toDomainToken(term))
      .filter(Boolean);

    return segmentTerms.some((segmentTerm) =>
      profileTerms.some((profileTerm) => profileTerm === segmentTerm || (segmentTerm.length >= 4 && profileTerm.includes(segmentTerm)))
    );
  });

  const pool = matchingProfiles.length ? matchingProfiles : PROFESSION_PROFILES;
  return sample(pool, Math.min(count, pool.length));
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
