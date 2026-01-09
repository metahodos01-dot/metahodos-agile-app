import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  location: string;
  image: string;
  rating: number;
  quote: string;
  highlight: string;
  results: string[];
}

const testimonials: Testimonial[] = [
  {
    name: 'Marco Verdi',
    role: 'CTO',
    company: 'FinTech Startup',
    location: 'Milano',
    image: '👨‍💼',
    rating: 5,
    quote: "L'AI ha fatto quello che 3 consulenti Agile non sono riusciti a fare in 6 mesi: ha portato ordine nel caos. Ora il planning dura 45 minuti invece di 4 ore, e finiamo il 90% degli sprint.",
    highlight: 'Sprint completati: 50% → 90%',
    results: [
      'Planning ridotto: 4h → 45 min',
      'Sprint success: +40%',
      'Team di 12 developer',
    ],
  },
  {
    name: 'Laura Bianchi',
    role: 'Scrum Master',
    company: 'E-commerce',
    location: 'Roma',
    image: '👩‍💼',
    rating: 5,
    quote: "L'AI Blocker Detector ci ha salvato 3 volte. Ci ha avvisato di problemi che avremmo scoperto solo a sprint finito. È come avere un senior PM che lavora 24/7 per te.",
    highlight: 'Blockers rilevati in anticipo: +70%',
    results: [
      'Rischi previsti con 3-5 giorni anticipo',
      '3 sprint salvati da blocchi',
      'Team più sereno e proattivo',
    ],
  },
  {
    name: 'Giorgio Neri',
    role: 'Product Owner',
    company: 'SaaS B2B',
    location: 'Torino',
    image: '👨‍💻',
    rating: 5,
    quote: "La feature AI Story Writer è pura magia. Scrivo 'checkout veloce' e mi genera 8 user stories con acceptance criteria migliori di quelle che avrei scritto io. Risparmio letteralmente 10 ore/settimana.",
    highlight: 'Backlog prep time: -85%',
    results: [
      'Da 3h a 30min refinement',
      'Qualità storie migliorata',
      'Più tempo per strategia',
    ],
  },
];

const stats = [
  { value: '500+', label: 'Team Agile attivi', sublabel: 'in tutta Italia' },
  { value: '-72%', label: 'Tempo Sprint Planning', sublabel: 'rispetto a media industry' },
  { value: '+34%', label: 'Sprint Completati', sublabel: 'con successo' },
  { value: '+28%', label: 'Velocity Migliorata', sublabel: 'in 3 mesi' },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-metahodos-orange/20 text-metahodos-orange font-semibold text-sm mb-4 border border-metahodos-orange/30">
            💬 TESTIMONIANZE
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-metahodos-gray mb-4 uppercase tracking-tight">
            Cosa Dicono i Team Che<br />
            Usano l'AI di Metahodos
          </h2>
          <p className="text-xl text-metahodos-text-secondary max-w-3xl mx-auto">
            Da Scrum Master frustrati a team ad alte performance in 30 giorni.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-gray-700 leading-relaxed mb-6 min-h-[140px]">
                "{testimonial.quote}"
              </blockquote>

              {/* Highlight */}
              <div className="inline-block px-4 py-2 rounded-lg bg-metahodos-green/20 text-metahodos-green-dark font-bold text-sm mb-6 border border-metahodos-green/40">
                {testimonial.highlight}
              </div>

              {/* Results */}
              <ul className="space-y-2 mb-6 pb-6 border-b border-gray-200">
                {testimonial.results.map((result, resultIndex) => (
                  <li key={resultIndex} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-metahodos-green mt-0.5">✓</span>
                    <span>{result}</span>
                  </li>
                ))}
              </ul>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-2xl">
                  {testimonial.image}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} @ {testimonial.company}
                  </div>
                  <div className="text-xs text-gray-500">{testimonial.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="bg-metahodos-gray rounded-2xl p-10 shadow-2xl">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-black text-white mb-2 uppercase">
              📊 Statistiche Aggregate (500+ team)
            </h3>
            <p className="text-gray-300">Metriche reali da utenti Metahodos negli ultimi 12 mesi</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-metahodos-orange mb-2">
                  {stat.value}
                </div>
                <div className="text-white font-semibold mb-1">{stat.label}</div>
                <div className="text-gray-400 text-sm">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 mb-6">Usato da team in:</p>
          <div className="flex flex-wrap justify-center gap-6 opacity-60">
            {['Milano', 'Roma', 'Torino', 'Bologna', 'Firenze', 'Napoli'].map((city) => (
              <div key={city} className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600 font-medium">
                📍 {city}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
