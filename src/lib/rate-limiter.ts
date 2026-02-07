// Rate limiting configuration and utilities
export const RATE_LIMIT_CONFIG = {
    MAX_ATTEMPTS: 5,
    WINDOW_MINUTES: 15,
    LOCKOUT_MINUTES: 15,
    PROGRESSIVE_DELAYS: [0, 1000, 2000, 4000, 8000, 16000], // ms
};

export function getProgressiveDelay(attemptCount: number): number {
    const delays = RATE_LIMIT_CONFIG.PROGRESSIVE_DELAYS;
    return delays[Math.min(attemptCount, delays.length - 1)];
}

export function calculateLockoutRemaining(lockedAt: Date): number {
    const lockoutEnd = new Date(lockedAt.getTime() + RATE_LIMIT_CONFIG.LOCKOUT_MINUTES * 60 * 1000);
    const now = new Date();
    const remaining = Math.max(0, lockoutEnd.getTime() - now.getTime());
    return Math.ceil(remaining / 1000); // Return seconds
}

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function sanitizeInput(input: string): string {
    return input.trim().toLowerCase();
}
