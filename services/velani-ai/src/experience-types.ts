import type { KnowledgeDocument, Locale, Message, Source } from './types.js';

export interface BusinessProfile {
  businessType: string;
  teamSize: string;
  locations: string;
  currentTools: string;
  challenge: string;
  constraints: string;
  approvalCadence: string;
}
export interface ProfileState { profile: BusinessProfile; revision: number }
export type WorkflowStage = 'schedule' | 'clock' | 'approve' | 'payroll';
export interface WorkflowStep {
  stage: WorkflowStage;
  productFact: string;
  recommendation: string;
  sourceIds: string[];
}
export interface PlanAction { title: string; owner: string; timing: string; details: string }
export interface WorkflowPlan {
  title: string;
  summary: string;
  profile: BusinessProfile;
  workflow: WorkflowStep[];
  actions: PlanAction[];
  assumptions: string[];
  questions: string[];
  sources: Source[];
  model: string;
}
export interface PlanRecord {
  id: string;
  brief?: string;
  plan: WorkflowPlan;
  revision: number;
  profileRevision: number;
  notes: string;
  edited: boolean;
  createdAt: string;
}
export interface PlanEngine {
  generate(input: { brief: string; locale: Locale; profile: BusinessProfile; history: Message[]; knowledge: KnowledgeDocument[] }): Promise<WorkflowPlan>;
}
export type PlanClaim = { state: 'new'; leaseToken: string } | { state: 'completed'; record: PlanRecord }
  | { state: 'busy' } | { state: 'conflict' };
export interface ExperienceRepository {
  getProfile(sessionId: string): Promise<ProfileState>;
  saveProfile(sessionId: string, expectedRevision: number, profile: BusinessProfile): Promise<ProfileState | 'conflict'>;
  claimPlan(sessionId: string, requestId: string, requestHash: string): Promise<PlanClaim>;
  completePlan(sessionId: string, requestId: string, leaseToken: string, plan: WorkflowPlan, profileRevision: number, brief?: string): Promise<PlanRecord>;
  failPlan(sessionId: string, requestId: string, leaseToken: string): Promise<void>;
  getPlan(sessionId: string, planId: string): Promise<PlanRecord | null>;
  editPlan(sessionId: string, planId: string, expectedRevision: number, actions: PlanAction[], notes: string): Promise<PlanRecord | 'conflict' | null>;
}
export const EMPTY_PROFILE: BusinessProfile = {
  businessType: '', teamSize: '', locations: '', currentTools: '', challenge: '', constraints: '', approvalCadence: '',
};
