import * as dom from '@/lib/dom';
import * as utils from '@/lib/utils';

export function renderSignupPage(onLoginClick: () => void, onSubmit: (name: string, email: string, password: string) => void): void {
  const signupPage = dom.querySelector<HTMLDivElement>('#signup-page')!;
  dom.clearChildren(signupPage);

  const html = `
    <div class="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <div class="flex w-full max-w-7xl mx-auto">
        <div class="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-12 flex-col justify-between rounded-l-3xl">
          <div>
            <h1 class="text-4xl font-bold tracking-tight">finance</h1>
          </div>
          <div>
            <h2 class="text-5xl font-bold mb-6 leading-tight">Keep track of your money and save for your future</h2>
            <p class="text-lg text-slate-300 leading-relaxed">Personal finance app puts you in control of your spending. Track transactions, set budgets, and add to savings pots easily.</p>
          </div>
        </div>
        
        <div class="w-full lg:w-1/2 p-8 lg:p-16 flex items-center justify-center">
          <div class="w-full max-w-md">
            <h2 class="text-4xl font-bold mb-2 text-slate-900 dark:text-white">Sign Up</h2>
            <p class="text-slate-600 dark:text-slate-400 mb-8">Create your account to get started</p>
            
            <form id="signup-form" class="space-y-6">
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Name</label>
                <input 
                  type="text" 
                  name="name" 
                  class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" 
                  placeholder="John Doe" 
                  required
                >
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" 
                  placeholder="you@example.com" 
                  required
                >
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <input 
                  type="password" 
                  name="password" 
                  class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" 
                  placeholder="••••••••" 
                  required
                >
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">Must be at least 8 characters</p>
              </div>
              
              <button 
                type="submit" 
                class="w-full bg-slate-900 dark:bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-all duration-200 mt-8"
              >
                Create Account
              </button>
            </form>
            
            <p class="mt-6 text-center text-slate-600 dark:text-slate-400">
              Already have an account? 
              <a href="#" id="go-to-login" class="font-semibold text-slate-900 dark:text-blue-400 hover:underline ml-1">Login</a>
            </p>
            
            <div id="signup-errors" class="mt-6 space-y-2"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  dom.setHTML(signupPage, html);
  dom.show(signupPage);

  const form = dom.querySelector<HTMLFormElement>('#signup-form')!;
  dom.addEventListener(form, 'submit', (e: Event) => {
    e.preventDefault();
    const values = dom.getFormValues(form);
    const validation = utils.validateSignupForm(values.name, values.email, values.password);

    const errorsDiv = dom.querySelector<HTMLDivElement>('#signup-errors')!;
    dom.clearChildren(errorsDiv);

    if (!validation.valid) {
      Object.values(validation.errors).forEach(error => {
        const errorEl = dom.createElement('div', {
          textContent: error,
          className: 'text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded',
        });
        dom.appendChild(errorsDiv, errorEl);
      });
      return;
    }

    onSubmit(values.name, values.email, values.password);
  });

  const loginLink = dom.querySelector<HTMLAnchorElement>('#go-to-login')!;
  dom.addEventListener(loginLink, 'click', (e: Event) => {
    e.preventDefault();
    onLoginClick();
  });
}
