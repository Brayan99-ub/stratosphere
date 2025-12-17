
import React from 'react';
import { 
  Shield, 
  TrendingUp, 
  Smartphone, 
  Globe, 
  Zap, 
  Users,
  Calendar
} from 'lucide-react';
import { Entity } from './types';

export const STRATO_ENTITIES: Entity[] = [
  {
    id: 'events',
    name: 'Strato Events',
    description: 'Organisation d\'événements prestigieux et mémorables.',
    icon: 'Calendar',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'fx',
    name: 'Strato FX',
    description: 'Expertise financière et marchés internationaux.',
    icon: 'TrendingUp',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'telecom',
    name: 'Strato x Telecom',
    description: 'Connectivité de pointe et solutions réseaux.',
    icon: 'Smartphone',
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 'zone',
    name: 'Strato Zone',
    description: 'Espaces d\'innovation et incubation digitale.',
    icon: 'Zap',
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 'global',
    name: 'Strato Global Business',
    description: 'Conseil stratégique et expansion internationale.',
    icon: 'Globe',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'clubs',
    name: 'Clubs Stratosphères',
    description: 'Incubateurs de talents et de culture noble.',
    icon: 'Users',
    color: 'from-slate-400 to-slate-600'
  }
];

export const PAYMENT_DETAILS = {
  number: '77216242',
  method: 'Orange Money',
  amount: '12 500 FCFA'
};

export const VALUES = [
  { name: 'Honneur', description: 'Agir avec intégrité.' },
  { name: 'Discipline', description: 'La rigueur comme fondation.' },
  { name: 'Confiance', description: 'Le ciment de nos alliances.' },
  { name: 'Respect', description: 'Reconnaître la valeur de chacun.' },
  { name: 'Courage', description: 'Oser bâtir l\'infini.' }
];
