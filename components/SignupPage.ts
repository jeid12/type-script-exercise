import * as dom from '@/lib/dom';
import * as utils from '@/lib/utils';

export function renderSignupPage(onLoginClick: () => void, onSubmit: (name: string, email: string, password: string) => void): void {
  const signupPage = dom.querySelector<HTMLDivElement>('#signup-page')!;
  dom.clearChildren(signupPage);

  const html = `
    <div class="min-h-screen flex bg-[#f8f4f0]">
      <div class="hidden lg:flex w-[560px] shrink-0 bg-[#201f24] text-white m-5 flex-col justify-between rounded-2xl p-10 overflow-hidden relative">
        <div class="relative z-10">
          <h1 class="text-2xl font-bold tracking-tight">finance.</h1>
        </div>
        <img
          src="/illustration.png"
          alt=""
          class="absolute inset-0 w-full h-full object-cover object-center opacity-60 pointer-events-none"
        />
        <div class="relative z-10">
          <h2 class="text-[2rem] font-bold mb-4 leading-tight">Keep track of your money and save for your future</h2>
          <p class="text-sm text-[#b3b3b3] leading-relaxed">Personal finance app puts you in control of your spending. Track transactions, set budgets, and add to savings pots easily.</p>
        </div>
      </div>

      <div class="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div class="w-full max-w-[560px] bg-white rounded-2xl p-8 lg:p-10">
          <h2 class="text-[32px] font-bold mb-8 text-[#201f24]">Sign Up</h2>

          <form id="signup-form" class="space-y-5">
            <div>
              <label class="block text-xs font-bold text-[#201f24] mb-2">Name</label>
              <input
                type="text"
                name="name"
                class="w-full px-5 py-3 border border-[#98908b] rounded-lg focus:outline-none focus:border-[#201f24] bg-white text-[#201f24] placeholder:text-[#98908b] text-sm"
                placeholder="John Doe"
                required
              >
            </div>

            <div>
              <label class="block text-xs font-bold text-[#201f24] mb-2">Email</label>
              <input
                type="email"
                name="email"
                class="w-full px-5 py-3 border border-[#98908b] rounded-lg focus:outline-none focus:border-[#201f24] bg-white text-[#201f24] placeholder:text-[#98908b] text-sm"
                placeholder="you@example.com"
                required
              >
            </div>

            <div>
              <label class="block text-xs font-bold text-[#201f24] mb-2">Password</label>
              <input
                type="password"
                name="password"
                class="w-full px-5 py-3 border border-[#98908b] rounded-lg focus:outline-none focus:border-[#201f24] bg-white text-[#201f24] placeholder:text-[#98908b] text-sm"
                placeholder="••••••••"
                required
              >
              <p class="text-xs text-[#696868] mt-2">Must be at least 8 characters</p>
            </div>

            <button
              type="submit"
              class="w-full bg-[#201f24] text-white py-4 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity mt-2"
            >
              Create Account
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-[#696868]">
            Already have an account?
            <a href="#" id="go-to-login" class="font-bold text-[#201f24] hover:underline ml-1">Login</a>
          </p>

          <div id="signup-errors" class="mt-4 space-y-2"></div>
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
