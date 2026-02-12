import { AddCircleOutline, Download, ExpandLess, ExpandMore, RemoveCircleOutline, Upload } from "@mui/icons-material";
import { Box, Button, Collapse, Divider, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import { useRef, useState, type FC } from "react";
import { getStorageKeys, type TaskGroup } from "../common";
import NumberField from "../components/NumberField";

export const SettingPage: FC = () => {
  const list = useRef<HTMLDivElement>(null);
  const [groups, setGroups] = useState(() =>
    getStorageKeys()
      .filter((item) => item.startsWith("group#"))
      .sort()
      .map((item) => JSON.parse(localStorage.getItem(item)!) as TaskGroup)
  );
  return (
    <Stack height="0px" flexGrow={1} p={1}>
      <Box display="flex" gap={1} mx={1} alignItems="center">
        <Typography variant="body2" align="left" sx={{ flexGrow: 1 }}>
          {groups.length}グループ（計{groups.reduce((prev, curr) => prev + curr.tasks.length, 0)}タスク）
        </Typography>
        <IconButton
          size="small"
          onClick={() => {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = ".json";
            fileInput.onchange = () => {
              const file = fileInput.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (e) => {
                const data = e.target?.result;
                if (typeof data !== "string") return;
                const groups = JSON.parse(data) as TaskGroup[];
                if (!confirm("現在の設定内容はファイルの内容で上書きされます")) return;
                getStorageKeys()
                  .filter((item) => item.startsWith("group#"))
                  .forEach((key) => localStorage.removeItem(key));
                groups.forEach((group) => localStorage.setItem(`group#${group.name}`, JSON.stringify(group)));
                setGroups(groups);
              };
              reader.readAsText(file);
            };
            fileInput.click();
          }}
        >
          <Upload />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => {
            const records = getStorageKeys()
              .filter((item) => item.startsWith("group#"))
              .sort()
              .map((item) => JSON.parse(localStorage.getItem(item)!) as TaskGroup);
            const dlLink = document.createElement("a");
            dlLink.download = `daily_checklist_${new Date().toJSON()}.json`;
            dlLink.href = URL.createObjectURL(
              new Blob([JSON.stringify(records)], { type: "application/octet-stream" })
            );
            dlLink.click();
          }}
        >
          <Download />
        </IconButton>
      </Box>
      <Divider sx={{ mt: 1 }} />
      <Stack ref={list} height="0px" flexGrow={1} gap={1} p={1} overflow="auto">
        {groups.map((group, i) => (
          <GroupCard key={i} group={group} setGroups={setGroups} />
        ))}
      </Stack>
      <Divider sx={{ mb: 1 }} />
      <Button
        disabled={!!groups.length && !!groups.find((group) => !group.name)}
        variant="outlined"
        onClick={() => {
          setGroups((olds) => [...olds, { name: "", startHour: 0, tasks: [] }]);
          //レンダリング後に～がうまくできなかったため苦肉の策で0.5秒後にスクロール
          setTimeout(() => list.current?.scrollTo({ top: list.current.offsetHeight, behavior: "smooth" }), 500);
        }}
      >
        追加
      </Button>
    </Stack>
  );
};

const GroupCard: FC<{ group: TaskGroup; setGroups: (value: React.SetStateAction<TaskGroup[]>) => void }> = ({
  group,
  setGroups,
}) => {
  const [edit, setEdit] = useState(!group.name);
  return (
    <Paper variant="outlined">
      {
        <Stack p={2}>
          <Box display="flex" gap={1} alignItems="center">
            <TextField
              fullWidth
              label="Taskグループ名"
              error={!group.name}
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
            <IconButton size="small" color="primary" disabled={!group.name} onClick={() => setEdit(!edit)}>
              {edit ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          {!group.name && (
            <Typography align="left" color="error" variant="caption">
              ※入力してください（重複不可）
            </Typography>
          )}
          <Collapse in={edit} timeout="auto">
            <Divider sx={{ my: 1 }} />
            <Stack gap={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography align="left" variant="body2" whiteSpace="nowrap">
                  Taskグループ開始時刻
                </Typography>
                <NumberField
                  value={group.startHour}
                  size="small"
                  min={0}
                  max={23}
                  onValueChange={(value) => {
                    if (value === null) return;
                    const newRecord = { ...group, startHour: value };
                    localStorage.setItem(`group#${newRecord.name}`, JSON.stringify(newRecord));
                    setGroups((olds) => olds.map((item) => (item.name === newRecord.name ? newRecord : item)));
                  }}
                />
                <Typography align="left" sx={{ flexGrow: 1 }} variant="body2" whiteSpace="nowrap">
                  時
                </Typography>
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
                <Box key={i} display="flex" alignItems="center">
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
                onClick={() => {
                  if (group.name && !confirm(`${group.name}を削除します`)) return;
                  setGroups((olds) => {
                    localStorage.removeItem(`group#${group.name}`);
                    const i = olds.findIndex((item) => item.name === group.name);
                    const newItems = [...olds];
                    newItems.splice(i, 1);
                    return newItems;
                  });
                }}
              >
                削除
              </Button>
            </Stack>
          </Collapse>
        </Stack>
      }
    </Paper>
  );
};
