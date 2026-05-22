function write(level, payload) {
  const body = typeof payload === 'string' ? { message: payload } : payload;
  const line = JSON.stringify({
    level,
    timestamp: new Date().toISOString(),
    ...body
  });

  if (level === 'error') {
    console.error(line);
    return;
  }

  if (level === 'warn') {
    console.warn(line);
    return;
  }

  console.info(line);
}

export const logger = {
  info: (payload) => write('info', payload),
  warn: (payload) => write('warn', payload),
  error: (payload) => write('error', payload)
};
