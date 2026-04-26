import { z } from 'zod';

const domainRe = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;

export const authEmailSchema = z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email cannot exceed 255 characters')
    .email('Please enter a valid email address')
    .refine(
        (val) => {
            const domain = val.split('@')[1];
            return domain !== undefined && domainRe.test(domain);
        },
        { message: 'Use a real email with a valid domain' },
    );

export const registerPasswordSchema = z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[a-z]/, 'Include at least one lowercase letter')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[0-9]/, 'Include at least one number')
    .regex(/[^A-Za-z0-9]/, 'Include at least one symbol');

function firstZodMessage(result: z.SafeParseError<unknown>): string {
    return result.error.issues[0]?.message ?? 'Invalid value';
}

export function parseAuthEmail(value: string): { ok: true; data: string } | { ok: false; message: string } {
    const r = authEmailSchema.safeParse(value.trim());
    if (r.success) {
        return { ok: true, data: r.data.toLowerCase() };
    }
    return { ok: false, message: firstZodMessage(r) };
}

export function parseRegisterPassword(
    value: string,
): { ok: true; data: string } | { ok: false; message: string } {
    const r = registerPasswordSchema.safeParse(value);
    if (r.success) {
        return { ok: true, data: r.data };
    }
    return { ok: false, message: firstZodMessage(r) };
}
