import { AutoDelete, EditCalendar, EventAvailable } from "@mui/icons-material";
import { BottomNavigation, BottomNavigationAction, Box, Divider, Paper } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useState } from "react";

import { CheckPage, SettingPage, CleanupPage } from "./pages";

function App() {
  const [bottomStatus, setBottomStatus] = useState(0);
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        component={Paper}
        position="absolute"
        top="0px"
        left="0px"
        height="100dvh"
        width="100dvw"
        display="flex"
        flexDirection="column"
      >
        <Box flexGrow={1} display="flex" flexDirection="column" height="0px" overflow="auto">
          {bottomStatus === 0 ? <CheckPage /> : bottomStatus === 1 ? <SettingPage /> : <CleanupPage />}
        </Box>
        <Divider />
        <BottomNavigation showLabels value={bottomStatus} onChange={(_, newValue) => setBottomStatus(newValue)}>
          <BottomNavigationAction label="Check" icon={<EventAvailable />} />
          <BottomNavigationAction label="Setting" icon={<EditCalendar />} />
          <BottomNavigationAction label="Cleanup" icon={<AutoDelete />} />
        </BottomNavigation>
      </Box>
    </LocalizationProvider>
  );
}

export default App;
