/**
 * Affirmations {{APP_NAME}} — banque locale courte (32 entrées) pour Gate 3.
 * En Gate 5+ ces affirmations seront tirées de la table `affirmations` (RLS open).
 */

export type AffirmationCategory =
  | "amour"
  | "puissance"
  | "abondance"
  | "sante"
  | "sagesse"
  | "gratitude";

export interface Affirmation {
  id: string;
  category: AffirmationCategory;
  text: string;
  /** Mode privilégié : jour (énergisant), nuit (apaisant), tous (universel). */
  mode: "jour" | "nuit" | "tous";
}

export const AFFIRMATIONS: Affirmation[] = [
  { id: "a1", category: "amour", mode: "tous", text: "Je m'accueille tel·le que je suis." },
  { id: "a2", category: "amour", mode: "jour", text: "L'amour que je porte rayonne autour de moi." },
  { id: "a3", category: "amour", mode: "nuit", text: "Je m'endors entouré·e de bienveillance." },
  { id: "a4", category: "amour", mode: "tous", text: "Je suis digne d'être aimé·e profondément." },
  { id: "p1", category: "puissance", mode: "jour", text: "Ma force intérieure est plus grande que mes peurs." },
  { id: "p2", category: "puissance", mode: "jour", text: "Je choisis avec clarté ce qui me ressemble." },
  { id: "p3", category: "puissance", mode: "tous", text: "Je suis l'auteur·e de ma vie." },
  { id: "p4", category: "puissance", mode: "jour", text: "Mon courage croît à chaque pas que je pose." },
  { id: "ab1", category: "abondance", mode: "tous", text: "L'abondance circule à travers moi." },
  { id: "ab2", category: "abondance", mode: "jour", text: "Je reçois tout ce dont j'ai besoin pour avancer." },
  { id: "ab3", category: "abondance", mode: "tous", text: "Je suis un canal d'abondance pour les autres." },
  { id: "ab4", category: "abondance", mode: "jour", text: "Je m'autorise à recevoir avec joie." },
  { id: "s1", category: "sante", mode: "tous", text: "Mon corps est un allié sage." },
  { id: "s2", category: "sante", mode: "nuit", text: "Mes cellules se régénèrent dans le sommeil." },
  { id: "s3", category: "sante", mode: "tous", text: "Je respire la vie à pleins poumons." },
  { id: "s4", category: "sante", mode: "jour", text: "Mon énergie se déploie avec douceur." },
  { id: "w1", category: "sagesse", mode: "tous", text: "Je fais confiance à mon intuition." },
  { id: "w2", category: "sagesse", mode: "jour", text: "Chaque expérience m'enseigne quelque chose." },
  { id: "w3", category: "sagesse", mode: "nuit", text: "Le silence m'apporte les réponses justes." },
  { id: "w4", category: "sagesse", mode: "tous", text: "Je suis là où je dois être, à cette minute." },
  { id: "g1", category: "gratitude", mode: "tous", text: "Merci pour ce souffle, pour ce battement, pour cet instant." },
  { id: "g2", category: "gratitude", mode: "jour", text: "Je salue ce nouveau jour avec gratitude." },
  { id: "g3", category: "gratitude", mode: "nuit", text: "Je clos cette journée en paix." },
  { id: "g4", category: "gratitude", mode: "tous", text: "Tout ce qui est, est précieux." },
  { id: "p5", category: "puissance", mode: "tous", text: "Je suis assez. J'ai toujours été assez." },
  { id: "a5", category: "amour", mode: "nuit", text: "Mon cœur s'apaise. Mon cœur est entier." },
  { id: "ab5", category: "abondance", mode: "tous", text: "Ma vie déborde de petits trésors invisibles." },
  { id: "s5", category: "sante", mode: "nuit", text: "Mon sommeil est profond, paisible, réparateur." },
  { id: "w5", category: "sagesse", mode: "tous", text: "J'ai le droit de prendre mon temps." },
  { id: "g5", category: "gratitude", mode: "tous", text: "Je remercie mon corps pour tout ce qu'il porte." },
  { id: "p6", category: "puissance", mode: "tous", text: "Je m'autorise à grandir." },
  { id: "a6", category: "amour", mode: "tous", text: "Je dépose toute auto-critique. Je m'aime simplement." },
];

export const SUBCONSCIENT_MODES = [
  {
    value: "jour",
    label: "Mode Jour — énergisant",
    description: "Affirmations tonifiantes, à pratiquer en marchant ou en travaillant.",
    accentVar: "var(--secondary)",
  },
  {
    value: "nuit",
    label: "Mode Nuit — apaisant",
    description: "Affirmations douces, idéales avant de s'endormir. Volume plafonné 50 dB.",
    accentVar: "var(--primary-soft)",
  },
] as const;

export type SubconscientMode = (typeof SUBCONSCIENT_MODES)[number]["value"];
