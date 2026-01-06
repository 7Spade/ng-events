import { routes } from './routes';

describe('Route metadata enforcement', () => {
  it('keeps acl/ability placeholders on protected root', () => {
    const root = routes.find(r => r.path === '');
    expect(root?.data?.acl).toEqual([]);
    expect(root?.data?.ability).toEqual([]);
    expect(root?.data?.requireWorkspace).toBeTrue();
  });

  it('exposes moduleKey on dashboard child route', async () => {
    const dashboardLoader = routes
      .find(r => r.path === '')!
      .children?.find(c => c.path === 'dashboard')!
      .loadChildren as () => Promise<any>;
    const dashboard = (await dashboardLoader()).routes.find((r: any) => r.path === 'v1');
    expect(dashboard.data.moduleKey).toBe('dashboard');
    expect(dashboard.data.requireWorkspace).toBeTrue();
  });
});

// END OF FILE
