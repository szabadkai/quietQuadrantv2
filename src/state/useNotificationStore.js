import { create } from "zustand";

let notificationId = 0;

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  actions: {
    push: (notification) => {
      const id = ++notificationId;
      const { notifications } = get();
      const visible = notifications.filter((n) => !n.dismissed).slice(-2);

      set({
        notifications: [
          ...visible,
          {
            ...notification,
            id,
            createdAt: Date.now(),
            dismissed: false
          }
        ]
      });

      setTimeout(
        () => get().actions.dismiss(id),
        notification.duration || 3000
      );
      return id;
    },
    dismiss: (id) => {
      const { notifications } = get();
      set({
        notifications: notifications.map((n) =>
          n.id === id ? { ...n, dismissed: true } : n
        )
      });
    }
  }
}));

export function notifyAchievement(achievement) {
  useNotificationStore.getState().actions.push({
    type: "achievement",
    title: "Achievement Unlocked!",
    message: achievement.name,
    icon: achievement.icon,
    duration: 4000
  });
}

export function notifyRankUp(newRank) {
  useNotificationStore.getState().actions.push({
    type: "rankUp",
    title: "Rank Up!",
    message: `You are now Rank ${newRank}`,
    icon: "⭐",
    duration: 3000
  });
}

export function notifyPersonalBest(stat, value) {
  useNotificationStore.getState().actions.push({
    type: "personalBest",
    title: "New Personal Best!",
    message: `${stat}: ${value}`,
    icon: "🏆",
    duration: 3000
  });
}
