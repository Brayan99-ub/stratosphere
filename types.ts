
export interface Entity {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface FormData {
  nom: string;
  prenom: string;
  cnib: string;
  cursus: string;
  cvSummary: string;
}

export type Step = 'intro' | 'about' | 'entities' | 'registration' | 'payment' | 'validation' | 'membership';
