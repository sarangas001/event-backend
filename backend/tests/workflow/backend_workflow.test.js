const fs = require('fs');
const path = require('path');

describe('GitHub Workflow - backend_Docker.yaml', () => {
  const workflowPath = path.join(__dirname, '..', '..', '..', '.github', 'workflows', 'backend_Docker.yaml');

  it('workflow file should exist', () => {
    const exists = fs.existsSync(workflowPath);
    expect(exists).toBe(true);
  });

  it('workflow should contain expected job and steps', () => {
    const content = fs.readFileSync(workflowPath, 'utf8');

    // Basic assertions about workflow contents that the CI depends on
    expect(content).toMatch(/name:\s*Hello Backend App to Docker/);
    expect(content).toMatch(/on:\s*/);
    expect(content).toMatch(/push:\s*/);
    expect(content).toMatch(/paths:\s*/);
    expect(content).toMatch(/- 'backend\/\*\*'/);
    expect(content).toMatch(/Run tests \(If any\)/);
  });
});
