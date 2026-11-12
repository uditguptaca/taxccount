// The key every login session and every check ticket is signed with.
//
// There is NO built-in key for a deployed site. For a long time every file that signs or checks a token carried
// `process.env.JWT_SECRET || '<a fixed text>'`, and the live site ran without the variable: it signed with a text
// that anyone holding the source code could read, so anyone could make a session for any user or role (found by the
// independent review, 2026-11-12). That text is burnt: it is refused even if someone sets it as the variable.
//
// Read at the moment of use, never when a module loads, so that building the app does not need the key.
const BURNT = 'abidebylaw-dev-secret-change-in-production-2026';

export function jwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (s && s !== BURNT) return s;
  // on a developer's machine (`next dev`, scripts) a fixed local key is fine: nothing there is reachable by others
  if (process.env.NODE_ENV !== 'production') return 'local-development-only-key-not-for-any-deployed-site';
  throw new Error('JWT_SECRET is not set (or is the old built-in text). Set a long random value in the hosting settings and redeploy.');
}
