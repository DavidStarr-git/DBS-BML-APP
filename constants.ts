
import { AssessmentTask } from './types';

export const THEME = {
  primary: '#0021A5', // UF Blue
  secondary: '#FA4616', // UF Orange
  bg: '#F8F9FA',
  surface: '#FFFFFF',
  textMain: '#1A1A1A',
  textSecondary: '#666666',
};

export const TASKS: AssessmentTask[] = [
  {
    id: 'mpt-2024',
    type: 'Phonation',
    title: 'Maximum Phonation Time',
    instruction: 'Inhale deeply and sustain "ah" for as long as possible. We are measuring laryngeal control.',
    prompt: 'AAAAHHHHH',
    icon: '🎤',
    durationSeconds: 15,
    significance: 'MPT is widely used as an objective measure of phonatory control and respiratory support. It is sensitive to changes in phonatory function. This extends to neurologically mediated speech deficits like DBS.'},
  {
    id: 'amr-2024',
    type: 'DDK',
    title: 'Alternating Motion Rate (AMR)',
    instruction: 'Repeat "pa-pa-pa" as quickly and clearly as you can.',
    prompt: 'pa-pa-pa-pa-pa',
    icon: '🥁',
    durationSeconds: 8,
    significance: 'Diadochokinetic (DDK) tasks are clinical measures of speech rate and motor control used in motor speech research and assessment. AMR rates are calculated and can be used to distinguish motor speech impairments in a population.'},
  {
    id: 'smr-2024',
    type: 'DDK',
    title: 'Sequential Motion Rate (SMR)',
    instruction: 'Repeat "pa-ta-ka" in a steady, rapid sequence.',
    prompt: 'pa-ta-ka, pa-ta-ka',
    icon: '⚙️',
    durationSeconds: 10,
    significance: 'A DDK task that is commonly used for measures of speech rate and motor control. SMR rates are calculated and used to distinguish between motor speech impairments in a population.'},
  {
    id: 'reading-rainbow',
    type: 'Reading',
    title: 'The Rainbow Passage',
    instruction: 'Read the full text provided below in your natural speaking voice.',
    prompt: 'When the sunlight strikes raindrops in the air, they act as a prism and form a rainbow. The rainbow is a division of white light into many beautiful colors. These take the shape of a long round arch, with its path high above, and its two ends apparently beyond the horizon. There is, according to legend, a boiling pot of gold at one end. People look, but no one ever finds it. When a man looks for something beyond his reach, his friends say he is looking for the pot of gold at the end of the rainbow.',
    icon: '📖',
    durationSeconds: 120,
    significance: 'Provides complimentary information about speech performance along with scripted tasks (Rainbow Passage). Spontaneous speech serves to capture natural variability in speech.'},
  {
    id: 'monologue-2024',
    type: 'Articulation',
    title: 'Spontaneous Speech Sample',
    instruction: 'Describe what you did yesterday for 30 seconds.',
    prompt: 'Talk about your day...',
    icon: '🗣️',
    durationSeconds: 30,
    significance: 'Standardized reading passages are widely used elicitation methods to evaluate speech across multiple subsystems (articulation, prosody, with a controlled text that contains most phenomes of English.'}
];
