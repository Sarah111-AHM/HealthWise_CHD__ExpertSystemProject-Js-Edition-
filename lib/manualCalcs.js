// Pre-computed manual calculation steps for 3 patients
// These show intermediate steps for the report

export const MANUAL_CALCULATIONS = [
  {
    id: 1,
    patient: 'Patient 1',
    inputs: { bp: 105, chol: 160, hr: 55 },
    fuzzification: {
      bp: { low: 0.667, medium: 0.0, high: 0.0 },
      chol: { low: 0.889, high: 0.0 },
      hr: { slow: 0.833, moderate: 0.0, fast: 0.0 },
    },
    ruleStrengths: [
      { rule: 1, bp: 'Low(0.667)', chol: 'Low(0.889)', hr: 'Slow(0.833)', strength: 0.667, output: 'Healthy' },
      { rule: 2, bp: 'Low(0.667)', chol: 'Low(0.889)', hr: 'Moderate(0.0)', strength: 0.0, output: 'Healthy' },
      { rule: 3, bp: 'Medium(0.0)', chol: 'Low(0.889)', hr: 'Moderate(0.0)', strength: 0.0, output: 'Middle' },
      { rule: 4, bp: 'Medium(0.0)', chol: 'High(0.0)', hr: 'Slow(0.833)', strength: 0.0, output: 'Middle' },
      { rule: 5, bp: 'High(0.0)', chol: 'Low(0.889)', hr: 'Moderate(0.0)', strength: 0.0, output: 'Sick' },
      { rule: 6, bp: 'High(0.0)', chol: 'High(0.0)', hr: 'Fast(0.0)', strength: 0.0, output: 'Sick' },
    ],
    aggregation: 'Healthy set clipped at 0.667; Middle & Sick have 0 activation',
    cogNote: 'COG weighted towards Healthy region (0–1.8)',
    sugenoNote: 'Weighted avg: 0.667×0.75 / 0.667 = 0.75',
  },
  {
    id: 2,
    patient: 'Patient 2',
    inputs: { bp: 120, chol: 195, hr: 65 },
    fuzzification: {
      bp: { low: 1.0, medium: 0.167, high: 0.0 },
      chol: { low: 0.0, high: 0.8 },
      hr: { slow: 1.0, moderate: 0.0, fast: 0.0 },
    },
    ruleStrengths: [
      { rule: 1, bp: 'Low(1.0)', chol: 'Low(0.0)', hr: 'Slow(1.0)', strength: 0.0, output: 'Healthy' },
      { rule: 2, bp: 'Low(1.0)', chol: 'Low(0.0)', hr: 'Moderate(0.0)', strength: 0.0, output: 'Healthy' },
      { rule: 3, bp: 'Medium(0.167)', chol: 'Low(0.0)', hr: 'Moderate(0.0)', strength: 0.0, output: 'Middle' },
      { rule: 4, bp: 'Medium(0.167)', chol: 'High(0.8)', hr: 'Slow(1.0)', strength: 0.167, output: 'Middle' },
      { rule: 5, bp: 'High(0.0)', chol: 'Low(0.0)', hr: 'Moderate(0.0)', strength: 0.0, output: 'Sick' },
      { rule: 6, bp: 'High(0.0)', chol: 'High(0.8)', hr: 'Fast(0.0)', strength: 0.0, output: 'Sick' },
    ],
    aggregation: 'Middle set clipped at 0.167; Healthy & Sick have 0 activation',
    cogNote: 'COG in Middle region (1.5–2.5 approximately)',
    sugenoNote: 'Weighted avg: 0.167×2.0 / 0.167 = 2.0',
  },
  {
    id: 3,
    patient: 'Patient 3',
    inputs: { bp: 165, chol: 186, hr: 95 },
    fuzzification: {
      bp: { low: 0.0, medium: 0.333, high: 0.333 },
      chol: { low: 0.45, high: 0.55 },
      hr: { slow: 0.0, moderate: 0.5, fast: 0.25 },
    },
    ruleStrengths: [
      { rule: 1, bp: 'Low(0.0)', chol: 'Low(0.45)', hr: 'Slow(0.0)', strength: 0.0, output: 'Healthy' },
      { rule: 2, bp: 'Low(0.0)', chol: 'Low(0.45)', hr: 'Moderate(0.5)', strength: 0.0, output: 'Healthy' },
      { rule: 3, bp: 'Medium(0.333)', chol: 'Low(0.45)', hr: 'Moderate(0.5)', strength: 0.333, output: 'Middle' },
      { rule: 4, bp: 'Medium(0.333)', chol: 'High(0.55)', hr: 'Slow(0.0)', strength: 0.0, output: 'Middle' },
      { rule: 5, bp: 'High(0.333)', chol: 'Low(0.45)', hr: 'Moderate(0.5)', strength: 0.333, output: 'Sick' },
      { rule: 6, bp: 'High(0.333)', chol: 'High(0.55)', hr: 'Fast(0.25)', strength: 0.25, output: 'Sick' },
    ],
    aggregation: 'Middle clipped at 0.333; Sick clipped at max(0.333, 0.25)=0.333',
    cogNote: 'COG shifts towards Sick region due to dual activation',
    sugenoNote: 'Weighted avg: (0.333×2.0 + 0.333×3.25 + 0.25×3.25) / (0.333+0.333+0.25)',
  },
];
