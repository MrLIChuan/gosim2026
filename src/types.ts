/**
 * PatentFlow OA - Domain Models
 */

export enum Jurisdiction {
  EPO = 'EPO',
  USPTO = 'USPTO',
  CNIPA = 'CNIPA',
  JPO = 'JPO',
  OTHER = 'OTHER'
}

export enum AnalysisState {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  STARTED = 'STARTED',
  PROGRESS = 'PROGRESS',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE'
}

export interface Matter {
  id: string;
  title: string;
  applicationNumber: string;
  applicant: string;
  clientName: string;
  jurisdiction: Jurisdiction;
  technologyArea: string;
  deadline: string;
  status: string;
  attorneyId: string;
  createdAt: string;
}

export interface Document {
  id: string;
  matterId: string;
  type: 'OFFICE_ACTION' | 'CLAIMS' | 'SPECIFICATION' | 'PRIOR_ART' | 'TRANSLATION';
  fileName: string;
  extractedText?: string;
  pageCount?: number;
  status: 'LOADED' | 'MISSING' | 'ERROR';
}

export interface Objection {
  id: string;
  article: string;
  claims: string;
  type: 'NOVELTY' | 'INVENTIVE_STEP' | 'CLARITY' | 'ADDED_MATTER' | 'UNITY' | 'FORMAL' | 'OTHER';
  reasoning: string;
  citedDocument?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sourcePage?: number;
  needsReview: boolean;
}

export interface TranslationRiskRow {
  id: string;
  featureId: string;
  sourceText: string;
  targetText: string;
  canonicalTerm: string;
  detectedTerm: string;
  riskLevel: 'SAFE' | 'LOW' | 'WARNING' | 'CRITICAL';
  issueType: string;
  explanation: string;
  suggestion: string;
}

export interface ClaimFeatureRow {
  id: string;
  featureId: string;
  limitation: string;
  d1Disclosure: string;
  d2Disclosure: string;
  assessment: 'DISCLOSED' | 'PARTIAL' | 'DISTINGUISHING' | 'UNCLEAR' | 'NEEDS_REVIEW';
  status: string;
}

export interface DraftResponse {
  id: string;
  matterId: string;
  content: string;
  updatedAt: string;
}

export interface ProviderStatus {
  kimi: 'mock' | 'configured' | 'disabled';
  minimax: 'mock' | 'configured' | 'disabled';
  epoOps: 'mock' | 'configured' | 'disabled';
  voice: 'mock' | 'configured' | 'disabled';
}

export interface TaskStatus {
  taskId: string;
  state: AnalysisState;
  percent: number;
  step: string;
  result?: any;
  error?: string;
}
