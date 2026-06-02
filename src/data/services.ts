export interface ServiceItem {
  id: string;
  title: string;
  price: number | null;
  priceLabel: string;
  description: string;
  duration: number; // minutes
  cites: number[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  services: ServiceItem[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'coupes',
    name: 'Coupes',
    services: [
      {
        id: 'coupe',
        title: 'Coupe',
        price: 20,
        priceLabel: '20€',
        description: 'Consultation, lavage, coupe ciseaux ou tondeuse, finition au rasoir sur les contours.',
        duration: 25,
        cites: [],
      },
      {
        id: 'coupe-enfant',
        title: 'Coupe enfant',
        price: 15,
        priceLabel: '15€',
        description: 'Moins de 15 ans — coupe adaptée en douceur, ciseaux ou tondeuse selon le style.',
        duration: 25,
        cites: [],
      },
      {
        id: 'coupe-bouc',
        title: 'Coupe + Bouc',
        price: 25,
        priceLabel: '25€',
        description: 'Coupe + rasage du visage en gardant uniquement le bouc, contours nets au rasoir.',
        duration: 25,
        cites: [],
      },
      {
        id: 'coupe-barbe',
        title: 'Coupe + Barbe',
        price: 30,
        priceLabel: '30€',
        description: 'Coupe + taille et mise en forme de la barbe, contours dessinés au rasoir.',
        duration: 30,
        cites: [],
      },
    ],
  },
  {
    id: 'barbe-crane',
    name: 'Barbe & Crâne',
    services: [
      {
        id: 'taille-barbe',
        title: 'Taille de barbe',
        price: 13,
        priceLabel: '13€',
        description: 'Peignage, taille à la longueur voulue, contours définis au rasoir ou tondeuse.',
        duration: 15,
        cites: [],
      },
      {
        id: 'rasage-crane',
        title: 'Rasage de crâne',
        price: 15,
        priceLabel: '15€',
        description: 'Tonte complète à la tondeuse, puis rasage au rasoir pour un résultat lisse et net.',
        duration: 15,
        cites: [],
      },
      {
        id: 'contours',
        title: 'Contours',
        price: 10,
        priceLabel: '10€',
        description: 'Reprise et traçage précis des contours (tempes, nuque, barbe) application d\'un airbrush pour combler légèrement les zones clairsemées.',
        duration: 10,
        cites: [],
      },
    ],
  },
  {
    id: 'design-couleur',
    name: 'Design & Couleur',
    services: [
      {
        id: 'design-barbe-cheveux',
        title: 'Design barbe / cheveux',
        price: null,
        priceLabel: 'Sur devis',
        description: 'Motifs ou tracés personnalisés au rasoir ou tondeuse, selon le dessin choisi avec le client.',
        duration: 30,
        cites: [],
      },
      {
        id: 'coloration',
        title: 'Coloration',
        price: null,
        priceLabel: 'Sur devis',
        description: 'Application permanente ou semi-permanente sur barbe ou cheveux, selon la teinte souhaitée.',
        duration: 30,
        cites: [],
      },
    ],
  },
];
