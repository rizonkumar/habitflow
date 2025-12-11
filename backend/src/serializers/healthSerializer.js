export const serializeHealthLog = (log) => {
  const base = {
    id: log.id,
    userId: log.userId?.toString(),
    type: log.type,
    date: log.date,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  };

  if (log.type === "water") {
    return {
      ...base,
      glasses: log.glasses,
      milliliters: log.milliliters,
    };
  }

  if (log.type === "gym") {
    return {
      ...base,
      workoutType: log.workoutType,
      durationMinutes: log.durationMinutes,
      caloriesBurned: log.caloriesBurned,
      notes: log.notes,
    };
  }

  if (log.type === "sleep") {
    return {
      ...base,
      bedtime: log.bedtime,
      wakeTime: log.wakeTime,
      sleepDurationMinutes: log.sleepDurationMinutes,
      quality: log.quality,
    };
  }

  if (log.type === "diet") {
    return {
      ...base,
      mealType: log.mealType,
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs,
      fat: log.fat,
      description: log.description,
    };
  }

  if (log.type === "custom") {
    return {
      ...base,
      name: log.name,
      value: log.value,
      unit: log.unit,
    };
  }

  return base;
};
