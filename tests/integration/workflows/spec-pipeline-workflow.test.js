/**
 * Spec Pipeline Workflow Test Suite
 * Tests: 6 phases (gather → assess → research → write → critique → plan)
 */

describe('Spec Pipeline Workflow — Requirements to Specification', () => {
  const testPipelineId = 'test-spec-001';

  test('Phase 1: @pm gather requirements', () => {
    // Workflow: @pm *gather captures FR, NFR, CON
    const requirements = gatherRequirements(testPipelineId);

    // Verify: requirements.json created
    expect(requirements).toBeDefined();
    expect(requirements.functionalRequirements.length).toBeGreaterThan(0);
    expect(requirements.nonFunctionalRequirements.length).toBeGreaterThan(0);
  });

  test('Phase 2: @architect assess complexity', () => {
    // Workflow: @architect *assess scores on 5 dimensions (1-5 each)
    const complexity = assessComplexity(testPipelineId);

    // Verify: complexity.json with score breakdown
    expect(complexity.totalScore).toBeGreaterThanOrEqual(5);
    expect(complexity.totalScore).toBeLessThanOrEqual(25);
    expect(['SIMPLE', 'STANDARD', 'COMPLEX']).toContain(complexity.classification);
  });

  test('Phase 3: @analyst research findings', () => {
    // Workflow: @analyst *research gathers evidence, patterns
    const research = conductResearch(testPipelineId);

    // Verify: research.json with findings
    expect(research).toBeDefined();
    expect(research.findings.length).toBeGreaterThan(0);
    expect(research.confidence).toBeGreaterThanOrEqual(0);
    expect(research.confidence).toBeLessThanOrEqual(10);
  });

  test('Phase 4: @pm write spec.md', () => {
    // Workflow: @pm *write-spec generates specification document
    const spec = writeSpec(testPipelineId);

    // Verify: spec.md created with Art.IV compliance (FR/NFR/CON traceability)
    expect(spec.content).toBeDefined();
    expect(spec.features).toBeDefined();
    expect(spec.traceability).toBeDefined();
  });

  test('Phase 5: @qa critique spec', () => {
    // Workflow: @qa *critique produces verdict (APPROVED | NEEDS_REVISION | BLOCKED)
    const critique = critiqueSpec(testPipelineId);

    // Verify: critique.json with score and verdict
    expect(['APPROVED', 'NEEDS_REVISION', 'BLOCKED']).toContain(critique.verdict);
    expect(critique.score).toBeGreaterThanOrEqual(0);
    expect(critique.score).toBeLessThanOrEqual(5);
  });

  test('Phase 6: @architect plan implementation', () => {
    // Workflow: @architect *plan generates implementation.yaml (if APPROVED)
    const plan = planImplementation(testPipelineId);

    // Verify: implementation.yaml with epics/stories
    expect(plan).toBeDefined();
    expect(plan.epics.length).toBeGreaterThan(0);
    expect(plan.stories.length).toBeGreaterThan(0);
  });

  test('Full Spec Pipeline: SIMPLE flow (3 phases skip)', () => {
    // Workflow: For SIMPLE complexity, phases 3 (research) skipped
    const pipeline = runSpecPipeline(testPipelineId, { complexity: 'SIMPLE' });

    // Verify: Phases 1,2,4,5 executed, phase 3 skipped
    expect(pipeline.phasesExecuted).toContain(1);
    expect(pipeline.phasesExecuted).toContain(2);
    expect(pipeline.phasesExecuted).not.toContain(3); // Skip research for SIMPLE
    expect(pipeline.phasesExecuted).toContain(4);
  });

  test('Full Spec Pipeline: STANDARD/COMPLEX flow (all 6 phases)', () => {
    // Workflow: For STANDARD/COMPLEX, all 6 phases executed
    const pipeline = runSpecPipeline(testPipelineId, { complexity: 'COMPLEX' });

    // Verify: All phases 1-6 executed
    expect(pipeline.phasesExecuted).toEqual([1, 2, 3, 4, 5, 6]);
    expect(pipeline.finalVerdict).toBeDefined();
  });
});
