import React from 'react';
import { MetahodosDots } from './MetahodosDots';

/**
 * ValuePropositionSection - Sezione valore in stile Metahodos.com
 * Con le 3 card: ASCOLTO, SEMPLIFICO, GUIDO
 */
export const ValuePropositionSection: React.FC = () => {
  const cards = [
    {
      title: 'ASCOLTO',
      underlineColor: 'bg-metahodos-red',
      content: `Andremo insieme nelle profondità della tua organizzazione, individuerò ciò che tu, il tuo staff e il tuo team percepite come ostacoli alla crescita.

Sarà sorprendente, vedrai!`,
    },
    {
      title: 'SEMPLIFICO',
      underlineColor: 'bg-metahodos-green',
      content: `Definiti gli aspetti critici mettiamo in pratica il processo Meta Hodos.

Quello che faccio non sarà snellire, ottimizzare proposte differenti, ma progettare alla vostra portata, per migliorare l'efficienza della tua azienda così da renderla più snella che mai.`,
    },
    {
      title: 'GUIDO',
      underlineColor: 'bg-metahodos-green',
      content: `Definite le soluzioni è il momento di metterle in pratica. Lo faccio con voi, passo passo, in tutti i cambiamenti fino a che non sarete in grado di mantenere in totale autonomia, ma non finirà qui.

Io sarò sempre li a supportarti!`,
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <MetahodosDots size="md" className="justify-center mb-6" />
          <h2 className="text-3xl md:text-4xl font-black text-metahodos-gray mb-4">
            Il mio superpotere è{' '}
            <span className="relative inline-block">
              LA SEMPLICITÀ
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-metahodos-orange" />
            </span>
          </h2>
          <p className="text-lg text-metahodos-text-secondary max-w-3xl mx-auto mt-8">
            Semplificare i processi, le comunicazioni, gli schemi e tutto ciò
            che rende un'azienda complicata e rigida.
          </p>
          <p className="text-base text-metahodos-text-secondary max-w-3xl mx-auto mt-4">
            Grazie al metodo e attraverso l'utilizzo di sistemi visivi faremo emergere gli
            obiettivi del team e troveremo le soluzioni migliori per raggiungerli.
          </p>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow"
            >
              <h3 className="text-2xl font-black text-metahodos-gray mb-4 relative inline-block">
                {card.title}
                <div className={`absolute -bottom-2 left-0 right-0 h-1 ${card.underlineColor}`} />
              </h3>
              <p className="text-metahodos-text-secondary leading-relaxed mt-6 whitespace-pre-line">
                {card.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
