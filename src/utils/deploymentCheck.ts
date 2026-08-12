import fingerprint from '../deployment/fingerprint.json';

declare global {
  interface Window {
    __APP_PHASES__?: string;
  }
}

export const checkDeploymentDrift = () => {
  window.__APP_PHASES__ = fingerprint.phases;
  const expected = '1-40';
  const live = fingerprint.phases;

  if (live !== expected) {
    console.warn(
      '⚠️ Deployment Drift Detected: Expected phases 1–40, got',
      live,
    );
  } else {
    console.log(
      `✅ Deployment Verified: Phases 1–40 Active (v${fingerprint.version})`,
    );
  }
};
