import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  darkMode: boolean;
  sidebarOpen: boolean;
}

const savedDarkMode = localStorage.getItem('darkMode') === 'true';

const initialState: UiState = {
  darkMode: savedDarkMode,
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', String(state.darkMode));
      if (state.darkMode) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebar: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { toggleDarkMode, toggleSidebar, setSidebar } = uiSlice.actions;

export default uiSlice.reducer;
