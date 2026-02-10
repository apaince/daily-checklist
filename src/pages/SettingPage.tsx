import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";
import { Box, Button, Divider, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState, type FC } from "react";
import { getStorageKeys, type TaskGroup } from "../common";

export const SettingPage: FC = () => {
  const [groups, setGroups] = useState(() =>
    getStorageKeys()
      .filter((item) => item.startsWith("group#"))
      .sort()
      .map((item) => JSON.parse(localStorage.getItem(item)!) as TaskGroup)
  );
  return (
    <Stack height="0px" flexGrow={1} gap={1} m={1}>
      {groups.map((group, i) => (
        <Paper variant="outlined" key={i}>
          <Stack p={2} gap={1}>
            <TextField
              fullWidth
              label="Taskグループ名"
              error={!group.name}
              helperText={!group.name && "グループ名を入力してください（重複不可）"}
              size="small"
              value={group.name}
              onChange={(e) => {
                if (!e.target.value || e.target.value === group.name || localStorage.getItem(`group#${e.target.value}`))
                  return;
                localStorage.removeItem(`group#${group.name}`);
                const newRecord = { ...group, name: e.target.value };
                localStorage.setItem(`group#${e.target.value}`, JSON.stringify(newRecord));
                setGroups((olds) => olds.map((item) => (item.name === group.name ? newRecord : item)));
              }}
            />
            <TextField
              disabled={!group.name}
              fullWidth
              label="開始時刻(0 ~ 23)"
              size="small"
              type="number"
              value={group.startHour}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value < 0 || 23 < value) return;
                const newRecord = { ...group, startHour: value };
                localStorage.setItem(`group#${newRecord.name}`, JSON.stringify(newRecord));
                setGroups((olds) => olds.map((item) => (item.name === newRecord.name ? newRecord : item)));
              }}
            />
            <Divider />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">Tasks</Typography>
              <IconButton
                disabled={!group.name}
                size="small"
                onClick={() => {
                  const newRecord = { ...group, tasks: [...group.tasks, ""] };
                  localStorage.setItem(`group#${newRecord.name}`, JSON.stringify(newRecord));
                  setGroups((olds) => olds.map((item) => (item.name === newRecord.name ? newRecord : item)));
                }}
              >
                <AddCircleOutline />
              </IconButton>
            </Box>
            {group.tasks.map((task, i) => (
              <Box display="flex" alignItems="center">
                <IconButton
                  size="small"
                  onClick={() => {
                    const newTasks = [...group.tasks];
                    newTasks.splice(i, 1);
                    const newRecord = { ...group, tasks: newTasks };
                    localStorage.setItem(`group#${newRecord.name}`, JSON.stringify(newRecord));
                    setGroups((olds) => olds.map((item) => (item.name === newRecord.name ? newRecord : item)));
                  }}
                >
                  <RemoveCircleOutline />
                </IconButton>
                <TextField
                  fullWidth
                  size="small"
                  value={task}
                  onChange={(e) => {
                    const newTasks = [...group.tasks];
                    newTasks[i] = e.target.value;
                    const newRecord = { ...group, tasks: newTasks };
                    localStorage.setItem(`group#${newRecord.name}`, JSON.stringify(newRecord));
                    setGroups((olds) => olds.map((item) => (item.name === newRecord.name ? newRecord : item)));
                  }}
                />
              </Box>
            ))}
            <Divider />
            <Button
              variant="outlined"
              color="error"
              onClick={() =>
                setGroups((olds) => {
                  localStorage.removeItem(`group#${group.name}`);
                  const newItems = [...olds];
                  newItems.splice(i, 1);
                  return newItems;
                })
              }
            >
              削除
            </Button>
          </Stack>
        </Paper>
      ))}
      <Button variant="outlined" onClick={() => setGroups((olds) => [...olds, { name: "", startHour: 0, tasks: [] }])}>
        追加
      </Button>
    </Stack>
  );
};
