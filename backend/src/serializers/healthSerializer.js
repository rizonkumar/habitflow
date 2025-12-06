export const serializeHealthLog = (log) => ({
  id: log.id,
  userId: log.userId?.toString(),
  type: log.type,
  amount: log.amount,
  unit: log.unit,
  metadata: log.metadata || {},
  date: log.date,
  createdAt: log.createdAt,
  updatedAt: log.updatedAt,
});

