export type ParsedRequirement = {
  title: string;
  details: string;
  deadline?: string;
  priority: 'High' | 'Medium' | 'Low';
};

const DEADLINE_REGEX = /(20\d{2}-\d{2}-\d{2}|\b\d{1,2}\/\d{1,2}\/20\d{2}\b|due\s+by\s+[^.,;\n]+)/i;

export function parseRfpText(text: string): ParsedRequirement[] {
  const lines = text
    .split(/\n|\r/)
    .map((l) => l.trim())
    .filter((l) => l.length > 10);

  const candidates = lines.filter((line) =>
    /\b(shall|must|required|proposal|deliver|compliance|deadline|due)\b/i.test(line)
  );

  return candidates.slice(0, 30).map((line, idx) => {
    const deadline = line.match(DEADLINE_REGEX)?.[0];
    const priority: ParsedRequirement['priority'] = /must|shall|required|compliance/i.test(line)
      ? 'High'
      : /proposal|deliver|due/i.test(line)
      ? 'Medium'
      : 'Low';

    return {
      title: `Requirement ${idx + 1}`,
      details: line,
      deadline,
      priority
    };
  });
}

export function generateDraft(requirement: string, library: { title: string; body: string; tags: string }[]) {
  const relevant = library
    .filter((a) => {
      const hay = `${a.title} ${a.tags}`.toLowerCase();
      return requirement
        .toLowerCase()
        .split(/\W+/)
        .some((k) => k.length > 4 && hay.includes(k));
    })
    .slice(0, 2);

  const snippets = relevant.map((r) => `- ${r.title}: ${r.body}`).join('\n');

  return `We acknowledge the requirement: "${requirement}".\n\nProposed response:\nOur team will satisfy this requirement through a structured delivery plan, clear ownership, and measurable outcomes.\n\nSupporting capabilities:\n${snippets || '- Existing standard capability statement available on request.'}\n\nAssumptions:\n- Final scope confirmation during kickoff\n- Access to stakeholder SMEs within 5 business days\n\nThis draft should be tailored with project-specific metrics before submission.`;
}
