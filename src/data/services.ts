export interface ServiceItem {
  id: string;
  title: string;
  price: number | null;
  priceLabel: string;
  description: string;
  cites: number[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  services: ServiceItem[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'coupes-rasage',
    name: 'Coupes & Rasage',
    services: [
      {
        id: 'coupe-homme',
        title: 'Coupe homme',
        price: 20,
        priceLabel: '20€',
        description: 'Consultation, lavage, coupe ciseaux ou tondeuse, finition au rasoir sur les contours.',
        cites: [],
      },
      {
        id: 'coupe-barbe',
        title: 'Coupe + Barbe',
        price: 30,
        priceLabel: '30€',
        description: 'Coupe homme + taille et mise en forme de la barbe, contours dessinés au rasoir.',
        cites: [],
      },
      {
        id: 'coupe-bouc',
        title: 'Coupe + Bouc',
        price: 25,
        priceLabel: '25€',
        description: 'Coupe homme + rasage du visage en gardant uniquement le bouc, contours nets au rasoir.',
        cites: [],
      },
      {
        id: 'coupe-rasage-traditionnel',
        title: 'Coupe + Rasage traditionnel',
        price: 35,
        priceLabel: '35€',
        description: 'Coupe homme + mousse chaude, rasage au coupe-chou, compresse froide pour fermer les pores.',
        cites: [],
      },
      {
        id: 'coupe-enfant',
        title: 'Coupe enfant',
        price: 15,
        priceLabel: '15€',
        description: 'Moins de 15 ans — coupe adaptée en douceur, ciseaux ou tondeuse selon le style.',
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
        cites: [],
      },
      {
        id: 'rasage-crane',
        title: 'Rasage du crâne',
        price: 15,
        priceLabel: '15€',
        description: 'Tonte complète à la tondeuse, puis rasage au rasoir pour un résultat lisse et net.',
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
        cites: [],
      },
      {
        id: 'coloration',
        title: 'Coloration',
        price: null,
        priceLabel: 'Sur devis',
        description: 'Application permanente ou semi-permanente sur barbe ou cheveux, selon la teinte souhaitée.',
        cites: [],
      },
    ],
  },
];
