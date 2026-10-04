/**
 * Dev scripts play as Jasper, already signed in, without touching the real
 * cloud save: requests to it fail as if offline, so progress stays in the page.
 * Pass a Playwright BrowserContext or Page.
 */
export async function asJasper(target) {
  await target.route(/workers\.dev\//, (r) => r.abort());
  await target.addInitScript(() => {
    localStorage.setItem('wizard-words:auth', JSON.stringify({ token: 'dev', who: 'jasper' }));
  });
}
