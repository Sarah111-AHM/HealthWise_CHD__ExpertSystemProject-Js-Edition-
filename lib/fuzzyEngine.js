// ============================================================
// FUZZY LOGIC ENGINE FOR CHD DIAGNOSIS
// ============================================================

// --- Membership Functions ---

function trimf(x, a, b, c) {
  // Triangular membership function
  if (x <= a || x >= c) return 0;
  if (x === b) return 1;
  if (x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

function trapmf(x, a, b, c, d) {
  // Trapezoidal membership function
  if (x <= a || x >= d) return 0;
  if (x >= b && x <= c) return 1;
  if (x < b) return (x - a) / (b - a);
  return (d - x) / (d - c);
}

// --- Blood Pressure Membership Functions ---
export function bpMembership(bp) {
  return {
    low:    trapmf(bp, 80, 100, 120, 135),
    medium: trimf(bp, 115, 145, 175),
    high:   trapmf(bp, 160, 175, 200, 220),
  };
}

// --- Cholesterol Membership Functions ---
export function cholMembership(chol) {
  return {
    low:  trapmf(chol, 80, 100, 170, 195),
    high: trapmf(chol, 175, 200, 280, 300),
  };
}

// --- Heart Rate Membership Functions ---
export function hrMembership(hr) {
  return {
    slow:     trapmf(hr, 30, 50, 70, 85),
    moderate: trimf(hr, 65, 85, 105),
    fast:     trapmf(hr, 90, 110, 200, 220),
  };
}

// --- Linguistic Hedge Operators ---
export function applyHedge(mu, hedge) {
  switch (hedge) {
    case 'very':        return Math.pow(mu, 2);     // concentration
    case 'somewhat':    return Math.pow(mu, 0.5);   // dilation
    case 'extremely':   return Math.pow(mu, 3);
    case 'indeed':      return Math.pow(mu, 2);
    case 'more_or_less':return Math.pow(mu, 0.5);
    case 'slightly':    return Math.pow(mu, 1.25);
    default:            return mu;
  }
}

// --- Fuzzy Rule Base (6 rules from Table 2) ---
const RULES = [
  { bp: 'low',    chol: 'low',  hr: 'slow',     output: 'healthy', weight: 1 },
  { bp: 'low',    chol: 'low',  hr: 'moderate', output: 'healthy', weight: 1 },
  { bp: 'medium', chol: 'low',  hr: 'moderate', output: 'middle',  weight: 1 },
  { bp: 'medium', chol: 'high', hr: 'slow',     output: 'middle',  weight: 1 },
  { bp: 'high',   chol: 'low',  hr: 'moderate', output: 'sick',    weight: 1 },
  { bp: 'high',   chol: 'high', hr: 'fast',     output: 'sick',    weight: 1 },
];

// --- Output Membership Functions (for COG defuzzification) ---
// CHD output range: 0.0 – 4.0
function outputHealthy(x) { return trapmf(x, -0.5, 0.0, 1.0, 1.8); }
function outputMiddle(x)  { return trimf(x, 1.0, 2.0, 3.0); }
function outputSick(x)    { return trapmf(x, 2.2, 3.0, 4.0, 4.5); }

// --- Inference Engine ---
export function inferenceEngine(bp, chol, hr, hedge = 'none') {
  const bpM   = bpMembership(bp);
  const cholM = cholMembership(chol);
  const hrM   = hrMembership(hr);

  const ruleStrengths = RULES.map((rule, idx) => {
    const bpDeg   = bpM[rule.bp]   || 0;
    const cholDeg = cholM[rule.chol] || 0;
    const hrDeg   = hrM[rule.hr]   || 0;
    const strength = Math.min(bpDeg, cholDeg, hrDeg); // AND = min
    return {
      rule: idx + 1,
      bp: rule.bp, bpDeg,
      chol: rule.chol, cholDeg,
      hr: rule.hr, hrDeg,
      output: rule.output,
      strength,
    };
  });

  return ruleStrengths;
}

// --- COG Defuzzification ---
export function defuzzifyCOG(ruleStrengths, hedge = 'none') {
  const steps = 400;
  const xMin = 0, xMax = 4;
  const dx = (xMax - xMin) / steps;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * dx;

    // Aggregate: for each x, take max of all clipped consequents
    let aggValue = 0;
    for (const r of ruleStrengths) {
      let outputMu = 0;
      if (r.output === 'healthy') outputMu = outputHealthy(x);
      else if (r.output === 'middle') outputMu = outputMiddle(x);
      else if (r.output === 'sick') outputMu = outputSick(x);

      let s = r.strength;
      if (hedge !== 'none') s = applyHedge(s, hedge);

      const clipped = Math.min(s, outputMu);
      aggValue = Math.max(aggValue, clipped);
    }

    numerator   += x * aggValue * dx;
    denominator += aggValue * dx;
  }

  return denominator > 0 ? numerator / denominator : 2.0;
}

// --- Sugeno Defuzzification ---
// Crisp output centers: healthy=0.75, middle=2.0, sick=3.25
const SUGENO_CENTERS = { healthy: 0.75, middle: 2.0, sick: 3.25 };

export function defuzzifySugeno(ruleStrengths, hedge = 'none') {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const r of ruleStrengths) {
    let s = r.strength;
    if (hedge !== 'none') s = applyHedge(s, hedge);
    const center = SUGENO_CENTERS[r.output];
    weightedSum += s * center;
    totalWeight += s;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 2.0;
}

// --- Classify CHD level ---
export function classifyCHD(value) {
  if (value < 1.5) return { label: 'Healthy', color: '#00ff9d', emoji: '💚' };
  if (value < 2.7) return { label: 'Middle Risk', color: '#ffb703', emoji: '🟡' };
  return { label: 'Sick', color: '#ff4d6d', emoji: '❤️' };
}

// --- Full diagnosis ---
export function diagnose(bp, chol, hr, hedge = 'none') {
  const bpM   = bpMembership(bp);
  const cholM = cholMembership(chol);
  const hrM   = hrMembership(hr);

  const ruleStrengths = inferenceEngine(bp, chol, hr, hedge);

  const cogValue     = defuzzifyCOG(ruleStrengths, hedge);
  const sugenoValue  = defuzzifySugeno(ruleStrengths, hedge);

  const cogClass     = classifyCHD(cogValue);
  const sugenoClass  = classifyCHD(sugenoValue);

  return {
    inputs: { bp, chol, hr },
    memberships: { bp: bpM, chol: cholM, hr: hrM },
    ruleStrengths,
    cog: { value: cogValue, classification: cogClass },
    sugeno: { value: sugenoValue, classification: sugenoClass },
    hedge,
  };
}

// --- Pre-defined patients ---
export const PRESET_PATIENTS = [
  { id: 1, name: 'Patient 1', bp: 105, chol: 160, hr: 55 },
  { id: 2, name: 'Patient 2', bp: 120, chol: 195, hr: 65 },
  { id: 3, name: 'Patient 3', bp: 165, chol: 186, hr: 95 },
];

// --- Membership curve data for visualization ---
export function getMembershipCurveData(type) {
  const points = 200;
  if (type === 'bp') {
    const range = Array.from({ length: points }, (_, i) => 80 + (i / points) * 140);
    return range.map(x => ({ x, low: bpMembership(x).low, medium: bpMembership(x).medium, high: bpMembership(x).high }));
  }
  if (type === 'chol') {
    const range = Array.from({ length: points }, (_, i) => 80 + (i / points) * 220);
    return range.map(x => ({ x, low: cholMembership(x).low, high: cholMembership(x).high }));
  }
  if (type === 'hr') {
    const range = Array.from({ length: points }, (_, i) => 30 + (i / points) * 200);
    return range.map(x => ({ x, slow: hrMembership(x).slow, moderate: hrMembership(x).moderate, fast: hrMembership(x).fast }));
  }
  // output
  const range = Array.from({ length: points }, (_, i) => (i / points) * 4);
  return range.map(x => ({ x, healthy: outputHealthy(x), middle: outputMiddle(x), sick: outputSick(x) }));
}

// --- 3D Surface Data ---
export function generate3DSurface(fixedHR = 75) {
  const bpRange   = Array.from({ length: 25 }, (_, i) => 95 + i * 5);
  const cholRange = Array.from({ length: 25 }, (_, i) => 95 + i * 8);

  const z = bpRange.map(bp =>
    cholRange.map(chol => {
      const r = inferenceEngine(bp, chol, fixedHR);
      return parseFloat(defuzzifyCOG(r).toFixed(3));
    })
  );

  return { x: cholRange, y: bpRange, z };
}
