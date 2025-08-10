import type { HolidayRule } from '../../../core/types/holiday.js';

export const holidays: HolidayRule[] = [
  // Feriados nacionais fixos
  {
    name: 'Confraternização Universal',
    type: 'fixed',
    rule: { month: 1, day: 1 },
  },
  {
    name: 'Tiradentes',
    type: 'fixed',
    rule: { month: 4, day: 21 },
  },
  {
    name: 'Dia do Trabalhador',
    type: 'fixed',
    rule: { month: 5, day: 1 },
  },
  {
    name: 'Independência do Brasil',
    type: 'fixed',
    rule: { month: 9, day: 7 },
  },
  {
    name: 'Nossa Senhora Aparecida',
    type: 'fixed',
    rule: { month: 10, day: 12 },
  },
  {
    name: 'Finados',
    type: 'fixed',
    rule: { month: 11, day: 2 },
  },
  {
    name: 'Proclamação da República',
    type: 'fixed',
    rule: { month: 11, day: 15 },
  },
  {
    name: 'Natal',
    type: 'fixed',
    rule: { month: 12, day: 25 },
  },
  // Feriados móveis baseados na Páscoa
  {
    name: 'Carnaval',
    type: 'easter-based',
    rule: { offset: -47 }, // 47 dias antes da Páscoa (Terça-feira de Carnaval)
  },
  {
    name: 'Sexta-feira Santa',
    type: 'easter-based',
    rule: { offset: -2 },
  },
  {
    name: 'Corpus Christi',
    type: 'easter-based',
    rule: { offset: 60 },
  },
];

export const regionalHolidays: Record<string, HolidayRule[]> = {
  acre: [
    {
      name: 'Dia da Amazônia',
      type: 'fixed',
      rule: { month: 9, day: 5 },
    },
    {
      name: 'Tratado de Petrópolis',
      type: 'fixed',
      rule: { month: 11, day: 17 },
    },
  ],
  alagoas: [
    {
      name: 'São João',
      type: 'fixed',
      rule: { month: 6, day: 24 },
    },
    {
      name: 'São Pedro',
      type: 'fixed',
      rule: { month: 6, day: 29 },
    },
  ],
  bahia: [
    {
      name: 'Independência da Bahia',
      type: 'fixed',
      rule: { month: 7, day: 2 },
    },
  ],
  ceara: [
    {
      name: 'Abolição da Escravidão no Ceará',
      type: 'fixed',
      rule: { month: 3, day: 25 },
    },
  ],
  df: [
    {
      name: 'Fundação de Brasília',
      type: 'fixed',
      rule: { month: 4, day: 21 },
    },
    {
      name: 'Dia da Consciência Negra',
      type: 'fixed',
      rule: { month: 11, day: 20 },
    },
  ],
  rj: [
    {
      name: 'Morte de Zumbi dos Palmares',
      type: 'fixed',
      rule: { month: 4, day: 23 },
    },
    {
      name: 'São Jorge',
      type: 'fixed',
      rule: { month: 4, day: 23 },
    },
  ],
  sp: [
    {
      name: 'Revolução Constitucionalista',
      type: 'fixed',
      rule: { month: 7, day: 9 },
    },
    {
      name: 'Dia da Consciência Negra',
      type: 'fixed',
      rule: { month: 11, day: 20 },
    },
  ],
};

export const observances: HolidayRule[] = [
  {
    name: 'Dia dos Namorados',
    type: 'fixed',
    rule: { month: 6, day: 12 },
  },
  {
    name: 'Dia das Mães',
    type: 'nth-weekday',
    rule: { month: 5, weekday: 0, nth: 2 }, // Segundo domingo de maio
  },
  {
    name: 'Dia dos Pais',
    type: 'nth-weekday',
    rule: { month: 8, weekday: 0, nth: 2 }, // Segundo domingo de agosto
  },
  {
    name: 'Dia das Crianças',
    type: 'fixed',
    rule: { month: 10, day: 12 },
  },
  {
    name: 'Dia do Professor',
    type: 'fixed',
    rule: { month: 10, day: 15 },
  },
  {
    name: 'Véspera de Natal',
    type: 'fixed',
    rule: { month: 12, day: 24 },
  },
  {
    name: 'Véspera de Ano Novo',
    type: 'fixed',
    rule: { month: 12, day: 31 },
  },
];

export const allHolidays = [...holidays, ...observances];
