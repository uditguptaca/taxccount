// Tailwind is used ONLY by the T1 intake screens. It is scoped to ".t1-scope" and has no global reset,
// so it cannot change how any other page in the app looks.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/components/t1/**/*.{ts,tsx}',
    './src/app/portal/tax-intake/**/*.{ts,tsx}',
    './src/app/dashboard/tax-intake/**/*.{ts,tsx}',
  ],
  important: '.t1-scope',
  corePlugins: { preflight: false },
  theme: { extend: {} },
  plugins: [],
};
