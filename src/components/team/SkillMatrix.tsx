import React from 'react';
import { MetahodosCard } from '../ui';
import type { TeamMember } from '../../lib/types';

interface SkillMatrixProps {
  members: TeamMember[];
}

// Skill level display configuration
const SKILL_LEVEL_CONFIG = {
  beginner: { label: 'Princ.', color: 'bg-gray-300 text-gray-800', value: 1 },
  intermediate: { label: 'Inter.', color: 'bg-blue-300 text-blue-800', value: 2 },
  advanced: { label: 'Avanz.', color: 'bg-green-300 text-green-800', value: 3 },
  expert: { label: 'Esperto', color: 'bg-purple-300 text-purple-800', value: 4 },
};

export const SkillMatrix: React.FC<SkillMatrixProps> = ({ members }) => {
  // Collect all unique skills across team
  const allSkills = new Map<string, { memberCount: number; totalLevel: number }>();

  members.forEach(member => {
    member.skills.forEach(skill => {
      const current = allSkills.get(skill.name) || { memberCount: 0, totalLevel: 0 };
      const levelValue = SKILL_LEVEL_CONFIG[skill.level].value;
      allSkills.set(skill.name, {
        memberCount: current.memberCount + 1,
        totalLevel: current.totalLevel + levelValue,
      });
    });
  });

  // Sort skills by member count (most common first)
  const sortedSkills = Array.from(allSkills.entries())
    .sort((a, b) => b[1].memberCount - a[1].memberCount)
    .slice(0, 20); // Top 20 skills

  if (sortedSkills.length === 0) {
    return (
      <MetahodosCard>
        <h3 className="text-lg font-semibold text-metahodos-navy mb-4">
          Matrice Competenze Team
        </h3>
        <div className="text-center py-12 text-metahodos-text-secondary">
          Nessuna competenza registrata. Aggiungi skills ai membri del team.
        </div>
      </MetahodosCard>
    );
  }

  return (
    <MetahodosCard>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-metahodos-navy">
          Matrice Competenze Team
        </h3>
        <p className="text-sm text-metahodos-text-secondary mt-1">
          Panoramica delle competenze disponibili nel team
        </p>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-metahodos-gray-300">
              <th className="text-left py-3 px-2 font-semibold text-metahodos-navy sticky left-0 bg-white z-10">
                Membro
              </th>
              {sortedSkills.map(([skillName]) => (
                <th
                  key={skillName}
                  className="text-center py-3 px-2 font-medium text-metahodos-navy min-w-[80px]"
                >
                  <div className="transform -rotate-45 origin-left whitespace-nowrap">
                    {skillName}
                  </div>
                </th>
              ))}
              <th className="text-center py-3 px-2 font-semibold text-metahodos-navy">
                Totale
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => {
              const memberSkillsMap = new Map(
                member.skills.map(s => [s.name, s.level])
              );

              return (
                <tr key={member.id} className="border-b border-metahodos-gray-200 hover:bg-metahodos-gray-50">
                  <td className="py-3 px-2 font-medium text-metahodos-navy sticky left-0 bg-white">
                    <div className="flex items-center">
                      <span className="truncate max-w-[150px]" title={member.name}>
                        {member.name}
                      </span>
                    </div>
                  </td>
                  {sortedSkills.map(([skillName]) => {
                    const level = memberSkillsMap.get(skillName);
                    if (!level) {
                      return (
                        <td key={skillName} className="text-center py-3 px-2">
                          <span className="text-metahodos-gray-300">—</span>
                        </td>
                      );
                    }

                    const config = SKILL_LEVEL_CONFIG[level];
                    return (
                      <td key={skillName} className="text-center py-3 px-2">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${config.color}`}
                          title={`${skillName} - ${config.label}`}
                        >
                          {config.value}
                        </span>
                      </td>
                    );
                  })}
                  <td className="text-center py-3 px-2 font-semibold text-metahodos-navy">
                    {member.skills.length}
                  </td>
                </tr>
              );
            })}

            {/* Coverage Row */}
            <tr className="bg-metahodos-gray-100 font-semibold">
              <td className="py-3 px-2 text-metahodos-navy sticky left-0 bg-metahodos-gray-100">
                Copertura
              </td>
              {sortedSkills.map(([skillName, data]) => (
                <td key={skillName} className="text-center py-3 px-2">
                  <div className="flex flex-col items-center">
                    <span className="text-metahodos-orange font-bold">
                      {data.memberCount}
                    </span>
                    <span className="text-xs text-metahodos-text-muted">
                      Avg: {(data.totalLevel / data.memberCount).toFixed(1)}
                    </span>
                  </div>
                </td>
              ))}
              <td className="text-center py-3 px-2 text-metahodos-navy">
                —
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-metahodos-gray-50 rounded-lg">
        <p className="text-xs font-semibold text-metahodos-navy mb-2">Legenda Livelli:</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center">
            <span className={`inline-block px-2 py-1 rounded font-medium ${SKILL_LEVEL_CONFIG.beginner.color} mr-2`}>
              1
            </span>
            <span className="text-metahodos-text-secondary">Principiante</span>
          </div>
          <div className="flex items-center">
            <span className={`inline-block px-2 py-1 rounded font-medium ${SKILL_LEVEL_CONFIG.intermediate.color} mr-2`}>
              2
            </span>
            <span className="text-metahodos-text-secondary">Intermedio</span>
          </div>
          <div className="flex items-center">
            <span className={`inline-block px-2 py-1 rounded font-medium ${SKILL_LEVEL_CONFIG.advanced.color} mr-2`}>
              3
            </span>
            <span className="text-metahodos-text-secondary">Avanzato</span>
          </div>
          <div className="flex items-center">
            <span className={`inline-block px-2 py-1 rounded font-medium ${SKILL_LEVEL_CONFIG.expert.color} mr-2`}>
              4
            </span>
            <span className="text-metahodos-text-secondary">Esperto</span>
          </div>
        </div>
      </div>
    </MetahodosCard>
  );
};
