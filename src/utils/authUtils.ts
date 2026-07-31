export const ISOLATED_KEYS = [
  'productivity_reminders',
  'reminders_drag_locked',
  'productivity_past_reminders',
  'productivity_notes',
  'notes_drag_locked',
  'productivity_note_tags',
  'budget_archives',
  'budget_current_month_key',
  'budget_months_data',
  'budget_autocomplete_suggestions',
  'budget_hide_amounts',
  'chart_market_color',
  'chart_market_style',
  'chart_cost_color',
  'chart_cost_style',
  'chart_show_market',
  'chart_show_cost',
  'fitness_profile',
  'fitness_daily_logs',
  'fitness_measurement_logs',
  'fitness_profile_locked',
  'productivity_notifications',
  'productivity_notification_sound',
  'productivity_triggered_events',
  'productivity_study_schedule',
  'countdown_start_date',
  'countdown_target_date',
  'countdown_main_title',
  'countdown_main_subtitle',
  'countdown_tracker_title',
  'countdown_calendar_type',
  'trading_journal_currency',
  'trading_initial_balance',
  'productivity_trades_v2',
  'quick_calc_balance',
  'quick_calc_presets',
  'quick_calc_forex_leverages',
  'quick_calc_crypto_leverages',
  'habits_active_tab',
  'productivity_habits',
  'habits_calendar_type',
  'habits_drag_locked',
  'productivity_study_user_name',
  'study_schedule_drag_locked',
  'study_deadline_drag_locked',
  'productivity_study_planner_tasks',
  'productivity_study_deadlines',
  'productivity_enabled_modules'
];

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  createdAt: string;
  data?: Record<string, string>;
}

export function backupUserData(userId: string) {
  if (!userId) return;
  const usersStr = localStorage.getItem('users') || '{}';
  try {
    const users = JSON.parse(usersStr);
    if (!users[userId]) return;
    
    const data: Record<string, string> = {};
    ISOLATED_KEYS.forEach(key => {
      const val = localStorage.getItem(key);
      if (val !== null) {
        data[key] = val;
      }
    });
    
    users[userId].data = data;
    localStorage.setItem('users', JSON.stringify(users));
  } catch (e) {
    console.error("Failed to backup user data", e);
  }
}

export function restoreUserData(userId: string) {
  if (!userId) return;
  const usersStr = localStorage.getItem('users') || '{}';
  try {
    const users = JSON.parse(usersStr);
    const userData = users[userId];
    if (!userData) return;
    
    ISOLATED_KEYS.forEach(key => {
      localStorage.removeItem(key);
    });
    
    const data = userData.data || {};
    Object.keys(data).forEach(key => {
      localStorage.setItem(key, data[key]);
    });
  } catch (e) {
    console.error("Failed to restore user data", e);
  }
}

export function clearLocalStorageForLogout() {
  ISOLATED_KEYS.forEach(key => {
    localStorage.removeItem(key);
  });
  localStorage.removeItem('currentUserId');
}
