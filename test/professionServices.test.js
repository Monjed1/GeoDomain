import assert from 'node:assert/strict';
import test from 'node:test';

import { expandServiceTerms, PROFESSION_PROFILES, resolveProfessionProfile } from '../src/data/professionServices.js';

test('resolves required doctor mapping from aliases', () => {
  const profile = resolveProfessionProfile('physician');
  const services = expandServiceTerms(profile);

  assert.equal(profile.profession, 'doctor');
  assert.ok(services.includes('clinic'));
  assert.ok(services.includes('medical'));
  assert.ok(services.includes('health'));
  assert.ok(services.includes('surgery'));
  assert.ok(services.includes('care'));
});

test('creates a usable fallback profile for custom professions', () => {
  const profile = resolveProfessionProfile('marine surveyor');
  const services = expandServiceTerms(profile);

  assert.equal(profile.profession, 'marine surveyor');
  assert.ok(services.includes('marine surveyor'));
  assert.ok(services.includes('service'));
});

test('resolves requested profession list to built-in profiles', () => {
  const requestedProfessions = [
    'lawyer',
    'attorney',
    'injurylawyer',
    'divorcelawyer',
    'criminallawyer',
    'immigrationlawyer',
    'dentist',
    'orthodontist',
    'doctor',
    'surgeon',
    'dermatologist',
    'chiropractor',
    'therapist',
    'psychologist',
    'psychiatrist',
    'pediatrician',
    'cardiologist',
    'neurologist',
    'gynecologist',
    'veterinarian',
    'optometrist',
    'pharmacy',
    'physiotherapist',
    'nutritionist',
    'plumber',
    'electrician',
    'roofer',
    'hvac',
    'contractor',
    'handyman',
    'landscaper',
    'cleaner',
    'locksmith',
    'carpenter',
    'mover',
    'remodeler',
    'flooring',
    'concrete',
    'poolbuilder',
    'realtor',
    'realestate',
    'broker',
    'propertymanager',
    'mortgagebroker',
    'homeinspector',
    'mechanic',
    'autorepair',
    'bodyshop',
    'cardealer',
    'tireshop',
    'towing',
    'carwash',
    'mobilemechanic',
    'accountant',
    'cpa',
    'bookkeeper',
    'consultant',
    'financialadvisor',
    'insurance',
    'insuranceagent',
    'taxpreparer',
    'businesscoach',
    'barber',
    'hairstylist',
    'makeupartist',
    'nailsalon',
    'esthetician',
    'tattooartist',
    'photographer',
    'weddingplanner',
    'webdesigner',
    'developer',
    'seo',
    'marketingagency',
    'graphicdesigner',
    'videographer',
    'appdeveloper',
    'aiconsultant',
    'tutor',
    'drivingschool',
    'musicteacher',
    'coach',
    'personaltrainer',
    'restaurant',
    'bakery',
    'cafe',
    'caterer',
    'chef',
    'foodtruck',
    'cleaningservice',
    'roofing',
    'tree service',
    'junkremoval',
    'pressurewashing',
    'solar',
    'medspa',
    'urgentcare',
    'painclinic',
    'dentalimplants',
    'bankruptcy',
    'taxlawyer',
    'familylaw',
    'estateplanning',
    'movingcompany',
    'storage',
    'pestcontrol',
    'security',
    'cybersecurity',
    'itservices',
    'managedit',
    'saas',
    'automation',
    'aiagency',
    'leadgeneration'
  ];

  for (const profession of requestedProfessions) {
    const profile = resolveProfessionProfile(profession);
    assert.ok(PROFESSION_PROFILES.includes(profile), `${profession} should resolve to a built-in profile`);
  }
});
