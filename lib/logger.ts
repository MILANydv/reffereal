import { prisma } from './db';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogOptions {
  level: LogLevel;
  message: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

export async function log(options: LogOptions): Promise<void> {
  const { level, message, source, metadata } = options;

  try {
    await prisma.systemLog.create({
      data: {
        level,
        message,
        source: source || 'system',
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error('Failed to write system log:', error);
  }
}

export const logger = {
  info: (message: string, source?: string, metadata?: Record<string, unknown>) =>
    log({ level: 'INFO', message, source, metadata }),
  
  warn: (message: string, source?: string, metadata?: Record<string, unknown>) =>
    log({ level: 'WARN', message, source, metadata }),
  
  error: (message: string, source?: string, metadata?: Record<string, unknown>) =>
    log({ level: 'ERROR', message, source, metadata }),
  
  debug: (message: string, source?: string, metadata?: Record<string, unknown>) =>
    log({ level: 'DEBUG', message, source, metadata }),
};
